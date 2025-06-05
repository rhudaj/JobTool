// New Database Interface using Provider Pattern
import { NamedCV, NamedCVContent, CVCore } from "@/lib/types";
import { DatabaseProviderFactory } from "./providers/factory";
import { CVInfo, Annotation } from "./providers/types";

export class DB {
  // -------------------------------------------------------------------------
  //                                  CV operations (Legacy - merged with core)
  // -------------------------------------------------------------------------

  static async all_cvs(): Promise<NamedCV[]> {
    const provider = await DatabaseProviderFactory.getProvider();
    return provider.all_cvs();
  }

  static async save_new_cv(cv: NamedCV): Promise<void> {
    const provider = await DatabaseProviderFactory.getProvider();
    return provider.save_new_cv(cv);
  }

  static async update_cv(cv: NamedCV, name: string): Promise<void> {
    const provider = await DatabaseProviderFactory.getProvider();
    return provider.update_cv(cv, name);
  }

  static async delete_cv(name: string): Promise<void> {
    const provider = await DatabaseProviderFactory.getProvider();
    return provider.delete_cv(name);
  }

  // -------------------------------------------------------------------------
  //                                  CV Content operations (New structure)
  // -------------------------------------------------------------------------

  static async all_cv_contents(): Promise<NamedCVContent[]> {
    const provider = await DatabaseProviderFactory.getProvider();
    return provider.all_cv_contents();
  }

  static async save_new_cv_content(cv: NamedCVContent): Promise<void> {
    const provider = await DatabaseProviderFactory.getProvider();
    return provider.save_new_cv_content(cv);
  }

  static async update_cv_content(cv: NamedCVContent, name: string): Promise<void> {
    const provider = await DatabaseProviderFactory.getProvider();
    return provider.update_cv_content(cv, name);
  }

  // -------------------------------------------------------------------------
  //                                  CV Core operations
  // -------------------------------------------------------------------------

  static async cv_core(): Promise<CVCore> {
    const provider = await DatabaseProviderFactory.getProvider();
    return provider.cv_core();
  }

  static async save_cv_core(core: CVCore): Promise<void> {
    const provider = await DatabaseProviderFactory.getProvider();
    return provider.save_cv_core(core);
  }

  // -------------------------------------------------------------------------
  //                                  CV Info operations
  // -------------------------------------------------------------------------

  static async cv_info(): Promise<CVInfo> {
    const provider = await DatabaseProviderFactory.getProvider();
    return provider.cv_info();
  }

  static async save_cv_info(newVal: CVInfo): Promise<void> {
    const provider = await DatabaseProviderFactory.getProvider();
    return provider.save_cv_info(newVal);
  }

  // -------------------------------------------------------------------------
  //                                  Annotations operations
  // -------------------------------------------------------------------------

  static async save_annotation(data: Annotation): Promise<void> {
    const provider = await DatabaseProviderFactory.getProvider();
    return provider.save_annotation(data);
  }
}

// Legacy connection function for backwards compatibility
export async function connectDB() {
  try {
    await DatabaseProviderFactory.getProvider();
    console.log('Connected to database provider');
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}
