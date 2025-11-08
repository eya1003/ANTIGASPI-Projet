import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './schemas/product.schema';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @Post('addProduct')
    async addProduct(@Body() productData: Partial<Product>): Promise<Product> {
        return this.productsService.addProduct(productData);
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
