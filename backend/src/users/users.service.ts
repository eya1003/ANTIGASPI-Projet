import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

  async create(user: User): Promise<User> {
    const newUser = new this.userModel(user);
    return newUser.save();
  }


  async signup(user: User): Promise<User> {
    console.log('➡️ signup appelé pour', user.email);

    const existingUser = await this.userModel.findOne({ email: user.email });
    if (existingUser) {
      console.log('❌ email déjà existant');
      throw new BadRequestException('Email already exists');
    }

    // Hash du mot de passe
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);
    user.password = hashedPassword;
    console.log('✅ Mot de passe hashé avec succès');

    // Génération d’un token aléatoire
    const token = crypto.randomBytes(32).toString('hex');

    const newUser = new this.userModel({
      ...user,
      verified: false,
      verificationToken: token,
      verificationExpires: new Date(Date.now() + 2 * 60 * 60 * 1000), // +2 heures
    });

    await newUser.save();
    console.log('💾 Nouvel utilisateur sauvegardé avec token:', token);

    // Envoi du mail de vérification
    try {
      await this.sendVerificationEmail(newUser.email, token);
      console.log('📤 Tentative d\'envoi du mail effectuée');
    } catch (err) {
      console.error('❌ Erreur lors de sendVerificationEmail:', err);
      // tu peux choisir de supprimer le user si envoi échoue, ou informé l'utilisateur
      // await this.userModel.findByIdAndDelete(newUser._id);
      throw new BadRequestException('Erreur lors de l\'envoi du mail de vérification');
    }

    return newUser;
  }

  async login(email: string, password: string): Promise<User> {
    console.log('➡️ Tentative de login pour:', email);
    const user = await this.userModel.findOne({ email });
    if (!user) {
      console.error('❌ Utilisateur non trouvé');
      throw new UnauthorizedException('Email not found');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log('🔑 Vérification du mot de passe:', passwordMatch);

    if (!passwordMatch) {
      console.error('❌ Mot de passe invalide');
      throw new UnauthorizedException('Invalid password');
    }

    if (!user.verified) {
      console.warn('⚠️ Compte non vérifié, refuse connexion');
      throw new UnauthorizedException('Veuillez vérifier votre compte par e-mail.');
    }

    console.log('✅ Login OK pour', email);
    return user;
  }

  async sendVerificationEmail(email: string, token: string) {
    console.log('📧 Préparation envoi mail pour:', email);
    console.log('⚙️ SMTP config (service,user):', process.env.service, process.env.user ? '[ok]' : '[missing]');

    // Créer le transporter
    const transporter = nodemailer.createTransport({
      service: process.env.service,
      auth: {
        user: process.env.user,
        pass: process.env.pass,
      },
    });

    // Vérifier la connexion SMTP avant d'envoyer
    try {
      await transporter.verify();
      console.log('🔌 SMTP ready');
    } catch (err) {
      console.error('❌ Erreur de connexion SMTP:', err);
      throw err; // remonter l'erreur pour que le caller la voie
    }

    const verifyUrl = `http://localhost:4200/verify?token=${token}`;

    const mailOptions = {
      from: process.env.user,
      to: email,
      subject: 'Vérification de votre compte ANTIGASPI',
      html: `
    <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; text-align: center;">
        <h2 style="color: #28a745; margin-bottom: 20px;">Bienvenue sur ANTIGASPI !</h2>
        <p style="font-size: 16px; color: #333;">Merci de vous être inscrit. Pour activer votre compte, cliquez sur le bouton ci-dessous :</p>

        <a href="${verifyUrl}" style="
          display: inline-block;
          margin: 20px 0;
          background-color: #28a745;
          color: white;
          padding: 12px 25px;
          font-size: 16px;
          font-weight: bold;
          text-decoration: none;
          border-radius: 8px;
        ">
          Activer mon compte
        </a>

        <p style="font-size: 14px; color: #555;">
        </p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

        <p style="font-size: 12px; color: #999;">
          Si vous n'avez pas créé ce compte, ignorez ce message.
        </p>
      </div>
    </div>
  `,
    };


    console.log('✉️ MailOptions préparés:', { to: mailOptions.to, subject: mailOptions.subject });

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Mail envoyé:', info);
      // si tu utilises ethereal, tu peux afficher l'URL de preview:
      if ((info as any).messageId && (nodemailer as any).getTestMessageUrl) {
        const preview = (nodemailer as any).getTestMessageUrl(info);
        if (preview) console.log('🔎 Preview email (si ethereal):', preview);
      }
      return info;
    } catch (error) {
      console.error('❌ sendMail error:', error);
      throw error;
    }
  }
  async verifyAccount(token: string): Promise<{ message: string }> {
    console.log('🟢 Vérification du compte avec le token :', token);

    const user = await this.userModel.findOne({ verificationToken: token });

    if (!user) {
      console.log('❌ Token invalide ou utilisateur introuvable');
      throw new BadRequestException('Token invalide ou utilisateur introuvable');
    }

    if (user.verified) {
      console.log('⚠️ Compte déjà vérifié');
      return { message: 'Compte déjà vérifié' };
    }

    if (!user.verificationExpires || user.verificationExpires < new Date()) {
      console.log('⏰ Le token a expiré');
      user.verificationToken = null;
      user.verificationExpires = null;
      await user.save();
      throw new BadRequestException('Le lien de vérification a expiré');
    }

    user.verified = true;
    user.verificationToken = null;
    user.verificationExpires = null;
    await user.save();

    console.log('✅ Compte vérifié avec succès');
    return { message: 'Compte vérifié avec succès' };
  }

  async forgotPassword(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException('Aucun utilisateur avec cet email');
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // valable 1h
    await user.save();

    const resetUrl = `http://localhost:4200/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      service: process.env.service,
      auth: {
        user: process.env.user,
        pass: process.env.pass,
      },
    });

    const mailOptions = {
      from: process.env.user,
      to: email,
      subject: 'Réinitialisation de votre mot de passe ANTIGASPI',
      html: `
    <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; text-align: center;">
        <h2 style="color: #28a745; margin-bottom: 20px;">Réinitialisation de mot de passe</h2>
        <p style="font-size: 16px; color: #333;">
          Vous avez demandé à réinitialiser votre mot de passe pour votre compte ANTIGASPI.
          Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :
        </p>

        <a href="${resetUrl}" style="
          display: inline-block;
          margin: 20px 0;
          background-color: #28a745;
          color: white;
          padding: 12px 25px;
          font-size: 16px;
          font-weight: bold;
          text-decoration: none;
          border-radius: 8px;
        ">
          Réinitialiser mon mot de passe
        </a>

        <p style="font-size: 14px; color: #555;">
          
        </p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

        <p style="font-size: 12px; color: #999;">
          Si vous n'avez pas demandé de réinitialisation, ignorez ce message ou contactez le support.
        </p>
      </div>
    </div>
  `,
    };


    await transporter.sendMail(mailOptions);
    return { message: 'Un e-mail de réinitialisation a été envoyé' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }, // non expiré
    });

    if (!user) {
      throw new BadRequestException('Token invalide ou expiré');
    }

    // ✅ Vérifier que le nouveau mot de passe est différent de l’ancien
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequestException('Le nouveau mot de passe doit être différent de l’ancien.');
    }

    // 🔒 Hash du nouveau mot de passe
    const saltRounds = 10;
    const hashed = await bcrypt.hash(newPassword, saltRounds);

    user.password = hashed;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    return { message: 'Mot de passe réinitialisé avec succès' };
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async update(id: string, updateData: Partial<User>): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async delete(id: string): Promise<User | null> {
    return this.userModel.findByIdAndDelete(id).exec();
  }
}
