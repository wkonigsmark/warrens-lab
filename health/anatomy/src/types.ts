export type AnatomyCategory = 'organ' | 'bone' | 'muscle' | 'ligament' | 'tendon' | 'nerve' | 'vessel';
export type BodySystem = 'circulatory' | 'respiratory' | 'digestive' | 'nervous' | 'endocrine' | 'skeletal' | 'muscular' | 'lymphatic' | 'reproductive' | 'urinary';

export interface AnatomicalComponent {
  id: string;
  name: string;
  category: AnatomyCategory;
  system: BodySystem | BodySystem[];
  location: string;
  function: string;
  details: string;
  connections?: string[];
  [key: string]: any;
}

export interface AnatomyDatabase {
  version: string;
  lastUpdated: string;
  metadata: {
    categories: AnatomyCategory[];
    systems: BodySystem[];
  };
  components: {
    organs: AnatomicalComponent[];
    bones?: AnatomicalComponent[];
    muscles?: AnatomicalComponent[];
    ligaments?: AnatomicalComponent[];
    tendons?: AnatomicalComponent[];
    nerves?: AnatomicalComponent[];
    vessels?: AnatomicalComponent[];
  };
}

export interface SearchResult {
  component: AnatomicalComponent;
  score: number;
}

export interface CategoryStats {
  category: string;
  count: number;
  systems: string[];
}
