// Types for database providers
import { NamedCV, NamedCVContent, CVCore, CVInfo, Annotation } from "@/lib/types";

// Common interface that both providers must implement
export interface DatabaseProvider {
  // Connection/initialization
  connect(): Promise<boolean>;

  // CV operations (legacy - returns merged CV + core)
  all_cvs(): Promise<NamedCV[]>;
  save_new_cv(cv: NamedCV): Promise<void>;
  update_cv(cv: NamedCV, name: string): Promise<void>;
  delete_cv(name: string): Promise<void>;

  // New CV Content operations (works with separate content + core)
  all_cv_contents(): Promise<NamedCVContent[]>;
  save_new_cv_content(cv: NamedCVContent): Promise<void>;
  update_cv_content(cv: NamedCVContent, name: string): Promise<void>;

  // CV Core operations
  cv_core(): Promise<CVCore>;
  save_cv_core(core: CVCore): Promise<void>;

  // CV Info operations
  cv_info(): Promise<CVInfo>;
  save_cv_info(newVal: CVInfo): Promise<void>;

  // Annotations operations
  save_annotation(data: Annotation): Promise<void>;
}
