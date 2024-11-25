import { Tables, TablesInsert } from "../../../supabase/types";
import { ServiceRequest } from "@/types/api";
import { WebsiteModel } from "../models/website.model";

export class WebsiteService {
  static async createWebsite(
    req: ServiceRequest,
    data: TablesInsert<"websites">
  ): Promise<Tables<"websites">> {
    // Validate required fields
    if (!data.name || !data.domain) {
      throw new Error("Name and domain are required");
    }

    // Validate domain format
    if (!this.isValidDomain(data.domain)) {
      throw new Error("Invalid domain format");
    }

    return WebsiteModel.create(req, data);
  }

  static async getWebsites(req: ServiceRequest): Promise<Tables<"websites">[]> {
    return WebsiteModel.findAll(req);
  }

  static async getWebsite(req: ServiceRequest, id: string): Promise<Tables<"websites">> {
    const website = await WebsiteModel.findOne(req, id);
    if (!website) {
      throw new Error("Website not found");
    }
    return website;
  }

  static async updateWebsite(
    req: ServiceRequest,
    id: string,
    data: Partial<TablesInsert<"websites">>
  ): Promise<Tables<"websites">> {
    // Validate domain format if provided
    if (data.domain && !this.isValidDomain(data.domain)) {
      throw new Error("Invalid domain format");
    }

    const website = await WebsiteModel.update(req, id, data);
    if (!website) {
      throw new Error("Website not found");
    }
    return website;
  }

  static async deleteWebsite(req: ServiceRequest, id: string): Promise<void> {
    const success = await WebsiteModel.delete(req, id);
    if (!success) {
      throw new Error("Website not found");
    }
  }

  static async getVerificationStatus(websiteId: string): Promise<boolean> {
    const status = await WebsiteModel.getVerificationStatus(websiteId);
    if (status === null) {
      throw new Error("Website not found");
    }
    return status;
  }

  static async verifyWebsite(websiteId: string): Promise<boolean> {
    const success = await WebsiteModel.setVerified(websiteId);
    if (!success) {
      throw new Error("Failed to verify website");
    }
    return true;
  }

  private static isValidDomain(domain: string): boolean {
    const pattern =
      /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    return pattern.test(domain);
  }
}
