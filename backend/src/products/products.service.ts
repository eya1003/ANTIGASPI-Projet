import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';

@Injectable()
export class ProductsService {
    constructor(@InjectModel(Product.name) private productModel: Model<ProductDocument>) { }

    async addProduct(productData: Partial<Product>): Promise<Product> {
        const newProduct = new this.productModel(productData);
        return newProduct.save();
    }

    async findOne(id: string): Promise<Product> {
        const product = await this.productModel.findById(id).populate('user', 'username email').exec();
        if (!product) throw new NotFoundException('Product not found');
        return product;
    }

    async findAll(): Promise<Product[]> {
    return this.productModel.find().populate('user', 'username email').exec();
  }

    async delete(id: string): Promise<{ message: string }> {
        const deleted = await this.productModel.findByIdAndDelete(id).exec();
        if (!deleted) throw new NotFoundException('Product not found');
        return { message: 'Product deleted successfully' };
    }
    async getUserProducts(userId: string): Promise<Product[]> {
        return this.productModel.find({ user: userId }).exec();
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
