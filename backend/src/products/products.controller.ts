import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './schemas/product.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post('addProductWithImage')
    @UseInterceptors(
        FileInterceptor('image', {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, cb) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname);
                    cb(null, `product-${uniqueSuffix}${ext}`);
                },
            }),
        }),
    )


    async addProductWithImage(
        @UploadedFile() image: Express.Multer.File,
        @Body() productData: Partial<Product>,
    ) {
        if (image) {
            productData.image = image.filename;
        }

        return this.productsService.addProduct(productData);
    }

    // 🔹 Produits actifs (non consommés)
    @Get('active/:userId')
    async getActiveProducts(@Param('userId') userId: string) {
        return this.productsService.getUserActiveProducts(userId);
    }

    // 🔹 Produits consommés
    @Get('consumed/:userId')
    async getConsumedProducts(@Param('userId') userId: string) {
        return this.productsService.getConsumedProducts(userId);
    }

    // 🔹 Produits expirés (gaspillés)
    @Get('expired/:userId')
    async getExpiredProducts(@Param('userId') userId: string) {
        return this.productsService.getExpiredProducts(userId);
    }

    @Get('alerts/:userId')
    async getExpiringAlerts(@Param('userId') userId: string) {
        return this.productsService.getUserExpiringAlerts(userId);
    }
    @Get('getAll')
    async findAll(): Promise<Product[]> {
        return this.productsService.findAll();
    }

    @Get('getOneProduct/:id')
    async findOne(@Param('id') id: string): Promise<Product> {
        return this.productsService.findOne(id);
    }

    @Delete('deleteProduct/:id')
    async delete(@Param('id') id: string): Promise<{ message: string }> {
        return this.productsService.delete(id);
    }

    @Get('user/:userId')
    async getUserProducts(@Param('userId') userId: string): Promise<Product[]> {
        return this.productsService.getUserProducts(userId);
    }

    @Get('expiring/:userId')
    async getExpiringProducts(
        @Param('userId') userId: string,
        @Query('daysAhead') daysAhead?: number
    ): Promise<Product[]> {
        return this.productsService.getExpiringProducts(userId, daysAhead);
    }
}
