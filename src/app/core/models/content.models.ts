export interface PageContent {
  title: string;
  metaDescription: string;
}

export interface HomePageData extends PageContent {
  hero: {
    headline: string;
    subheadline: string;
    ctaText: string;
    heroImage: string;
  };
  featuresObj: { // 'features' is a reserved word or common, so featuresObj or keeping it simple
    title: string;
    items: { icon: string; title: string; description: string }[];
  }[];
}

export interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

export interface FeaturesPageData extends PageContent {
  hero: {
    title: string;
    subtitle: string;
  };
  featureList: FeatureItem[];
}

export interface PricingPlan {
  name: string;
  price: string;
  period: string;
  features: string[];
  ctaText: string;
  highlight?: boolean;
}

export interface PricingPageData extends PageContent {
  title: string;
  plans: PricingPlan[];
}

// Add more as needed
