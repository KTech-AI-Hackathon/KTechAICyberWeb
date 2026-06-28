import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Home Page Object Model
 *
 * Represents the main landing page of the KTech website
 */
export class HomePage extends BasePage {
  // Hero section
  readonly heroSection: Locator;
  readonly heroTitle: Locator;
  readonly heroSubtitle: Locator;
  readonly heroStats: Locator;

  // Navigation
  readonly navLogo: Locator;
  readonly navLinks: Locator;
  readonly servicesLink: Locator;
  readonly contactLink: Locator;

  // Services section
  readonly servicesSection: Locator;
  readonly serviceCards: Locator;

  // Contact section
  readonly contactSection: Locator;
  readonly contactItems: Locator;

  // Footer
  readonly footer: Locator;

  constructor(page: Page) {
    super(page);

    // Hero section
    this.heroSection = page.locator('#hero');
    this.heroTitle = page.locator('.hero-title');
    this.heroSubtitle = page.locator('.hero-subtitle');
    this.heroStats = page.locator('.hero-stats');

    // Navigation
    this.navLogo = page.locator('.nav-logo');
    this.navLinks = page.locator('.nav-links');
    this.servicesLink = page.locator('.nav-links a[href="#services"]');
    this.contactLink = page.locator('.nav-links a[href="#contact"]');

    // Services section
    this.servicesSection = page.locator('#services');
    this.serviceCards = page.locator('.card');

    // Contact section
    this.contactSection = page.locator('#contact');
    this.contactItems = page.locator('.contact-item');

    // Footer
    this.footer = page.locator('.footer');
  }

  /**
   * Navigate to home page
   */
  async goto() {
    await super.goto('');
    await this.waitForLoad();
  }

  /**
   * Get hero title text
   */
  async getHeroTitle(): Promise<string> {
    await this.heroTitle.waitFor({ state: 'visible' });
    return await this.heroTitle.textContent() || '';
  }

  /**
   * Get hero subtitle text
   */
  async getHeroSubtitle(): Promise<string> {
    await this.heroSubtitle.waitFor({ state: 'visible' });
    return await this.heroSubtitle.textContent() || '';
  }

  /**
   * Click navigation link
   */
  async clickNavLink(linkName: 'services' | 'contact') {
    const linkMap = {
      services: this.servicesLink,
      contact: this.contactLink,
    };
    await linkMap[linkName].click();
  }

  /**
   * Get count of service cards
   */
  async getServiceCardCount(): Promise<number> {
    await this.servicesSection.waitFor({ state: 'visible' });
    return await this.serviceCards.count();
  }

  /**
   * Get service card details by index
   */
  async getServiceCardDetails(index: number): Promise<{ title: string; description: string }> {
    const card = this.serviceCards.nth(index);
    const title = await card.locator('h3').textContent() || '';
    const description = await card.locator('p').textContent() || '';
    return { title, description };
  }

  /**
   * Get contact item details by index
   */
  async getContactItemDetails(index: number): Promise<{ title: string; value: string }> {
    const item = this.contactItems.nth(index);
    const title = await item.locator('h4').textContent() || '';
    const value = await item.locator('p').textContent() || '';
    return { title, value };
  }

  /**
   * Scroll to section
   */
  async scrollToSection(section: 'services' | 'contact') {
    const sectionMap = {
      services: '#services',
      contact: '#contact',
    };
    await this.page.locator(sectionMap[section]).scrollIntoViewIfNeeded();
  }

  /**
   * Verify navbar is visible
   */
  async verifyNavbarVisible(): Promise<boolean> {
    return await this.navbar.isVisible();
  }

  /**
   * Verify footer is visible
   */
  async verifyFooterVisible(): Promise<boolean> {
    return await this.footer.isVisible();
  }
}
