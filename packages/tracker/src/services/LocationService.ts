export class LocationService {
  private location: { 
    country: string; 
    region: string; 
    city: string; 
    lat: number; 
    lon: number; 
  } | null = null;

  async getLocation() {
    try {
      const response = await fetch("https://ipinfo.io/json?token=0d420c2f8c5887");
      const data = await response.json();

      this.location = {
        country: data.country,
        region: data.region,
        city: data.city,
        lat: parseFloat(data.loc.split(',')[0]),
        lon: parseFloat(data.loc.split(',')[1]),
      };

      return this.location;
    } catch (error) {
      console.error("Failed to fetch location:", error);
      return null;
    }
  }

  getCurrentLocation() {
    return this.location;
  }
} 