// Helper functions to convert between old CV structure and new CVContent structure
import {
    CV,
    CVContent,
    CVCore,
    NamedCV,
    NamedCVContent,
    CVSection,
    CVContentSection,
    SectionItem,
    CVContentItem,
    CVContentExperience,
    Experience,
    Summary,
    CVInfoContent,
    CVInfo,
} from "./types";

/* -----------------------------------------------------------------------------
            NamedCVContent + CVCore --> NamedCV (for loading/editing)
----------------------------------------------------------------------------- */

/**
 * Converts a NamedCVContent and CVCore into a NamedCV
 */
export function mergeNamedContentWithCore(
    namedContent: NamedCVContent,
    core: CVCore
): NamedCV {
    return {
        // CV Meta Info
        name: namedContent.name,
        path: namedContent.path,
        tags: namedContent.tags,
        // CV Data
        data: {
            header_info: {
                name: core.full_name,
                links: core.contact_links,
            },
            sections: namedContent.data.sections.map((section) => ({
                name: section.name,
                bucket_type: section.bucket_type,
                items: section.items.map((item) =>
                    mergeItemWithCore(item, section.name, core)
                ),
            })),
        },
    };
}

/**
 * Merges a content item with core data to create a full section item
 */
function mergeItemWithCore(
    contentItem: CVContentItem,
    sectionName: string,
    core: CVCore
): SectionItem {
    // If it's a summary item, return as-is
    if ("summary" in contentItem) {
        return contentItem as Summary;
    }
    // Otherwise, its an Experience item

    // Ensure its valid (must have id)
    if (!("id" in contentItem)) {
        throw Error(`No id found in CVContentItem (section = ${sectionName}`);
    }
    const referenceItem = contentItem as CVContentExperience;

    // Find the core item by ID (case-insensitive)

    // first find the secton
    const coreSection = core.sections.find(
        (section) => section.id.toLowerCase() === sectionName.toLowerCase()
    );

    if (!coreSection) {
        throw new Error(
            `No core section found for section name: ${sectionName}`
        );
    }

    // then get the item.
    const coreItem = coreSection.items.find(
        (item) => item.id.toLowerCase() === referenceItem.id.toLowerCase()
    );

    if (!coreItem) {
        console.warn(`⚠️ Warning: No core item found with id: ${referenceItem.id} in section: ${sectionName}. Skipping merge.`);
        // Return the content item as-is if no core data is found
        return referenceItem as Experience;
    }

    // Merge core data with content data
    const mergedItem: Experience = {
        ...referenceItem,
        ...coreItem,
    };

    return mergedItem;
}

/* -----------------------------------------------------------------------------
                NamedCV --> CVContent (inverse operation, for saving)
----------------------------------------------------------------------------- */

export function extractContentFromNamedCV(ncv: NamedCV): NamedCVContent {
    return {
        ...ncv,
        data: extractContentFromCV(ncv.data)
    };
}

/**
 * Converts a full CV back to CVContent (strips core data)
 * This is useful when saving CVs - we only save the content part
 */
export function extractContentFromCV(cv: CV): CVContent {
    return {
        sections: cv.sections.map((section) => ({
            name: section.name,
            bucket_type: section.bucket_type,
            items: section.items.map((item) =>
                extractContentFromItem(item, section.name)
            ),
        })),
    };
}

/**
 * Extracts content from a section item, removing core data and adding ID reference
 */
function extractContentFromItem(
    item: SectionItem,
    sectionName: string
): CVContentItem {
    // If it's a summary item, return as-is
    if ("summary" in item) {
        return item;
    }

    const experienceItem = item as Experience;

    // Return only the content parts, with the preserved ID reference
    const contentItem: CVContentExperience = {
        id: experienceItem.id,
        description: experienceItem.description || [],
        item_list: experienceItem.item_list || [],
    };

    return contentItem;
}


/* -----------------------------------------------------------------------------
                CVInfoContent --> CVInfo (for loading/editing)
----------------------------------------------------------------------------- */

export function mergeCVInfoContentWithCore(
    content: CVInfoContent,
    core: CVCore
): CVInfo {
    const result: CVInfo = {};

    // Iterate through each section
    for (const [sectionName, sectionContent] of Object.entries(content)) {
        result[sectionName] = {};

        // Iterate through each item in the section
        for (const [itemId, itemVersions] of Object.entries(sectionContent)) {
            result[sectionName][itemId] = {};

            // Iterate through each version of the item
            for (const [versionId, contentItem] of Object.entries(itemVersions)) {
                // Add the ID to the content item if it's not a summary
                const itemWithId = "summary" in contentItem
                    ? contentItem
                    : { ...contentItem, id: itemId };

                // Merge the content item with core data to create a full SectionItem
                result[sectionName][itemId][versionId] = mergeItemWithCore(
                    itemWithId,
                    sectionName,
                    core
                );
            }
        }
    }

    return result;
}