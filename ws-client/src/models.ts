export type DomElementData = {
    outerHTML?: string;
    tagName?: string;
    id?: string;
    className?: string;
    textContent?: string;
};
/**
 * Type guard function to check if an object is of type DomElementData
 * @param obj - the object to check
 * @returns true if the object is of type DomElementData, false otherwise
 */
export function isDomElementData(obj: any): obj is DomElementData {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'textContent' in obj &&
        typeof obj.textContent === 'string' &&
        'outerHTML' in obj &&
        typeof obj.outerHTML === 'string' &&
        'tagName' in obj &&
        typeof obj.tagName === 'string' &&
        'id' in obj &&
        typeof obj.id === 'string' &&
        'className' in obj &&
        typeof obj.className === 'string'
    )
  }