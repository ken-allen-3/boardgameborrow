import seedData from '../config/seedData.json';

export interface SeedDataService {
  getSeededGames: () => typeof seedData.games;
  getSeededGroups: () => typeof seedData.groups;
  getSeededGameNights: () => typeof seedData.gameNights;
  getSeededUsers: () => typeof seedData.users;
  isSeededContent: (id: string) => boolean;
}

class SeedDataServiceImpl implements SeedDataService {
  private seededGameIds: Set<string>;
  private seededGroupIds: Set<string>;
  private seededGameNightIds: Set<string>;
  private seededUserIds: Set<string>;
  private enabled: boolean = true;

  constructor() {
    // Initialize sets of seeded content IDs for quick lookup
    this.seededGameIds = new Set(seedData.games.map(game => game.id));
    this.seededGroupIds = new Set(seedData.groups.map(group => group.id));
    this.seededGameNightIds = new Set(seedData.gameNights.map(night => night.id));
    this.seededUserIds = new Set(seedData.users.map(user => user.id));
  }

  public getSeededGames() {
    return this.enabled ? seedData.games : [];
  }

  public getSeededGroups() {
    return this.enabled ? seedData.groups : [];
  }

  public getSeededGameNights() {
    return this.enabled ? seedData.gameNights : [];
  }

  public getSeededUsers() {
    return this.enabled ? seedData.users : [];
  }

  public isSeededContent(id: string): boolean {
    return (
      this.seededGameIds.has(id) ||
      this.seededGroupIds.has(id) ||
      this.seededGameNightIds.has(id) ||
      this.seededUserIds.has(id)
    );
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }
}

// Export singleton instance
export const seedDataService = new SeedDataServiceImpl();
