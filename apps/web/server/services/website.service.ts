import { WebsiteModel } from '../models/website.model';
import { Website } from '@/types';

export class WebsiteService {
  static async createWebsite(req: any, data: Partial<Website>): Promise<Website> {
    // Validate required fields
    if (!data.name || !data.domain) {
      throw new Error('Name and domain are required');
    }

    // Validate domain format
    if (!this.isValidDomain(data.domain)) {
      throw new Error('Invalid domain format');
    }

    return WebsiteModel.create(req, data);
  }

  static async getWebsites(req: any): Promise<Website[]> {
    return WebsiteModel.findAll(req);
  }

  static async getWebsite(req: any, id: string): Promise<Website> {
    const website = await WebsiteModel.findOne(req, id);
    if (!website) {
      throw new Error('Website not found');
    }
    return website;
  }

  static async updateWebsite(req: any, id: string, data: Partial<Website>): Promise<Website> {
    // Validate domain format if provided
    if (data.domain && !this.isValidDomain(data.domain)) {
      throw new Error('Invalid domain format');
    }

    const website = await WebsiteModel.update(req, id, data);
    if (!website) {
      throw new Error('Website not found');
    }
    return website;
  }

  static async deleteWebsite(req: any, id: string): Promise<void> {
    const success = await WebsiteModel.delete(req, id);
    if (!success) {
      throw new Error('Website not found');
    }
  }

  private static isValidDomain(domain: string): boolean {
    const pattern = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    return pattern.test(domain);
  }
}
