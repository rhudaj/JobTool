// Helper functions to convert between old CV structure and new CVContent structure
import { CV, CVContent, CVCore, NamedCV, NamedCVContent, CVSection, CVContentSection, SectionItem, CVContentItem, Experience, CVContentReference } from "./types";

/**
 * Converts a CVContent and CVCore into a full CV structure
 */
export function mergeContentWithCore(content: CVContent, core: CVCore): CV {
    return {
        header_info: {
            name: core.full_name,
            links: core.contact_links
        },
        sections: content.sections.map(section => mergeSectionWithCore(section, core))
    };
}

/**
 * Converts a NamedCVContent and CVCore into a NamedCV
 */
export function mergeNamedContentWithCore(namedContent: NamedCVContent, core: CVCore): NamedCV {
    return {
        ...namedContent,
        data: mergeContentWithCore(namedContent.data, core)
    };
}

/**
 * Merges a content section with core data to create a full CV section
 */
function mergeSectionWithCore(contentSection: CVContentSection, core: CVCore): CVSection {
    return {
        name: contentSection.name,
        bucket_type: contentSection.bucket_type,
        items: contentSection.items.map(item => mergeItemWithCore(item, contentSection.name, core))
    };
}

/**
 * Merges a content item with core data to create a full section item
 */
function mergeItemWithCore(contentItem: CVContentItem, sectionName: string, core: CVCore): SectionItem {
    // If it's a summary item (no id), return as-is
    if (!('id' in contentItem)) {
        return contentItem;
    }

    const referenceItem = contentItem as CVContentReference;

    // Find the core item by ID
    const coreSection = core.sections.find(section => section.id === sectionName);

    if (!coreSection) {
        throw new Error(`No core section found for section name: ${sectionName}`);
    }

    const coreItem = coreSection.items.find(item => item.id === referenceItem.id);

    if (!coreItem) {
        throw new Error(`No core item found with id: ${referenceItem.id} in section: ${sectionName}`);
    }

    // Merge core data with content data
    const mergedItem: Experience = {
        title: coreItem.title || '',
        role: coreItem.role || '',
        location: coreItem.location || '',
        date: coreItem.date || undefined,
        description: referenceItem.description || [],
        item_list: referenceItem.item_list || [],
        link: coreItem.link
    };

    return mergedItem;
}

/**
 * Converts a full CV back to CVContent (strips core data)
 * This is useful when saving CVs - we only save the content part
 */
export function extractContentFromCV(cv: CV): CVContent {
    return {
        sections: cv.sections.map(section => extractContentFromSection(section))
    };
}

/**
 * Extracts content from a CV section, removing core data
 */
function extractContentFromSection(section: CVSection): CVContentSection {
    return {
        name: section.name,
        bucket_type: section.bucket_type,
        items: section.items.map(item => extractContentFromItem(item, section.name))
    };
}

/**
 * Extracts content from a section item, removing core data and adding ID reference
 */
function extractContentFromItem(item: SectionItem, sectionName: string): CVContentItem {
    // If it's a summary item, return as-is
    if ('summary' in item) {
        return item;
    }

    const experienceItem = item as Experience;

    // For experience items, we expect them to have an ID stored somewhere
    // This is a placeholder - in practice, you should store IDs when creating items
    throw new Error(`Cannot extract content from item without stored ID in section: ${sectionName}. Item title: ${experienceItem.title}`);
}
