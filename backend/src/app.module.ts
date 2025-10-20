import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    // On charge le module ConfigModule pour pouvoir utiliser les variables d'environnement
    ConfigModule.forRoot({
      isGlobal: true, // rend ConfigService disponible partout sans réimporter
    }),
    
    // On configure Mongoose de manière asynchrone avec la variable d'environnement
    MongooseModule.forRootAsync({
      imports: [ConfigModule],        // On importe ConfigModule pour accéder à ConfigService
      inject: [ConfigService],        // On injecte ConfigService dans la factory
      useFactory: async (configService: ConfigService) => {
        // On récupère l'URI de connexion MongoDB depuis le fichier .env
        const uri = configService.get<string>('MONGODB_URI');

        // Si la variable n'est pas définie, on lève une erreur pour éviter une connexion invalide
        if (!uri) {
          throw new Error('La variable MONGODB_URI est manquante dans .env');
        }

        // On retourne un objet attendu par MongooseModule avec la clé uri
        return { uri }; 
      },
    }),
    
    UsersModule,
  ],
  
  // Déclarations des contrôleurs utilisés dans le projet
  controllers: [AppController],
  
  // Déclarations des services utilisés dans le projet
  providers: [AppService],
})
export class AppModule {}
