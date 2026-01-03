import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { User } from 'src/users/schemas/user.schema';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as nodemailer from 'nodemailer';

@Injectable()
export class ProductsService {

    private readonly logger = new Logger(ProductsService.name);

    constructor(
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
        @InjectModel(User.name) private userModel: Model<User>,) { }

    async addProduct(productData: Partial<Product>): Promise<Product> {
        const newProduct = new this.productModel(productData);
        return newProduct.save();
    }

    async findOne(id: string): Promise<Product> {
        const product = await this.productModel.findById(id).populate('user', 'username email').exec();
        if (!product) throw new NotFoundException('Product not found');
        return product;
    }

    async markAsConsumed(productId: string): Promise<Product> {
        const product = await this.productModel.findById(productId);
        if (!product) throw new NotFoundException('Product not found');

        product.consumedAt = new Date(); // date de consommation
        product.status = 'ok';           // même si "soon" avant
        await product.save();

        return product;
    }


    /**
  * 🔔 Tous les jours à 00:00
  */
    //@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    @Cron('*/10 * * * *') // toutes les minutes
    async checkExpiringProducts() {
        this.logger.log('⏳ Vérification des produits proches de l’expiration...');

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const expiringProducts = await this.productModel.find({
            expiryDate: { $lte: tomorrow },
        }).populate('user');

        for (const product of expiringProducts) {
            await this.sendExpiryMail(product);
            //await this.saveWebAlert(product);
        }

        this.logger.log(`📦 ${expiringProducts.length} produits traités`);
    }

    /**
     * 📩 Envoi du mail comme UsersService
     */
    async sendExpiryMail(product: Product) {
        const user = product.user as unknown as User;

        const transporter = nodemailer.createTransport({
            service: process.env.service,
            auth: { user: process.env.user, pass: process.env.pass },
        });

        const mailOptions = {
            from: process.env.user,
            to: user.email,
            subject: `⚠ Votre produit "${product.name}" expire bientôt`,
            html: `
        <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
            <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; text-align: center;">
                <h2 style="color: #d9534f; margin-bottom: 20px;">Alerte expiration</h2>

                <p style="font-size: 16px; color: #333;">
                    Bonjour ${user.username ?? ''},
                </p>

                <p style="font-size: 16px; color: #333;">
                    Votre produit <strong>${product.name}</strong> expire le <b>${product.expiryDate.toDateString()}</b>.
                </p>

                <p style="font-size: 16px; color: #333;">
                    ➡ Pensez à le consommer ou à l’utiliser dans une recette.
                </p>

                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

                <p style="font-size: 12px; color: #999;">
                    Si vous n'avez pas ajouté ce produit, ignorez ce message.
                </p>
            </div>
        </div>
        `,
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            this.logger.log(`📬 Mail envoyé à ${user.email} pour le produit "${product.name}"`);
        } catch (err) {
            this.logger.error(`❌ Erreur envoi mail pour ${user.email}: ${err.message}`);
        }
    }


    /**
     * 🔔 Sauvegarde alerte pour affichage dans Angular
     */
    /*
    async saveWebAlert(product: Product) {
        await this.productModel.findByIdAndUpdate(product., {
            savedFromWaste: true,
        });
    }*/
    async getUserExpiringAlerts(userId: string) {
        return this.productModel.find({
            user: userId,
            savedFromWaste: true
        });
    }


    async findAll(): Promise<Product[]> {
        return this.productModel.find().populate('user', 'username email').exec();
    }

    async delete(id: string): Promise<{ message: string }> {
        const deleted = await this.productModel.findByIdAndDelete(id).exec();
        if (!deleted) throw new NotFoundException('Product not found');
        return { message: 'Product deleted successfully' };
    }

    async getUserProducts(userId: string): Promise<any[]> {
        const products = await this.productModel.find({ user: userId }).exec();
        const today = new Date();

        return products.map(p => {
            const diffDays = Math.ceil((new Date(p.expiryDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            let status: 'soon' | 'expired' | 'ok' = 'ok';
            if (diffDays < 0) status = 'expired';       // déjà expiré
            else if (diffDays <= 2) status = 'soon';    // à consommer vite

            return { ...p.toObject(), status };
        });
    }

    async getUserActiveProducts(userId: string): Promise<any[]> {
        const today = new Date();

        const products = await this.productModel.find({
            user: userId,
            consumedAt: null, // uniquement les produits non consommés
        }).exec();

        return products.map(p => {
            const diffDays = Math.ceil((new Date(p.expiryDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            let status: 'soon' | 'expired' | 'ok' = 'ok';
            if (diffDays < 0) status = 'expired';
            else if (diffDays <= 2) status = 'soon';

            return { ...p.toObject(), status };
        });
    }

    async getConsumedProducts(userId: string): Promise<Product[]> {
        return this.productModel.find({
            user: userId,
            consumedAt: { $ne: null } // tous les produits consommés
        }).exec();
    }

    async getExpiredProducts(userId: string): Promise<Product[]> {
        const today = new Date();
        return this.productModel.find({
            user: userId,
            expiryDate: { $lt: today }
        }).exec();
    }




    async getExpiringProducts(userId: string, daysAhead: number = 3): Promise<Product[]> {
        const now = new Date();
        const futureDate = new Date();
        futureDate.setDate(now.getDate() + daysAhead);

        return this.productModel.find({
            user: userId,
            expiryDate: { $gte: now, $lte: futureDate }
        }).exec();
    }
}
