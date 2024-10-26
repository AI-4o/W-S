/**
 * This object can be used in the case where we have the following:
 * - an array of objects [obj1, obj2,..., objn]
 * - the objects have some properties that have the same keys
 * - we want the values of these properties to stay synchronized
 * when we update one of the objects
 * i.e. we want a reciprocal binding between the properties.
 *
 * note: the objects reference is also updated, not only the properties.
 *
 * This is useful for example when we have a list of objects that are the same
 * except for some properties, and we want to update the properties of all objects
 * when we update one of them.
 *
 * @param bindingArray - the array of objects to be updated
 * @param bindingKeys - the keys of the properties to be synchronized
 * @param objectsLabels - optional labels for referring to the objects in bindingArray
 * (see updateFrom method)
 */
export class PropertyBinder {
  bindingArray: any[]; // the array of objects to be updated
  bindingKeys: string[]; // the keys of the properties to be synchronized
  objectsLabels?: string[]; // the labels of the objects
  constructor(
    bindingArray: any[],
    bindingKeys: string[],
    objectsLabels?: string[]
  ) {
    this.bindingKeys = bindingKeys;
    this.bindingArray = bindingArray;
    this.objectsLabels = objectsLabels;
  }
  /**
   * Get the object from the bindingArray whose name or label matches the given name.
   * @param name - the name or label of the object to get
   * @returns the object from the bindingArray whose name or label matches the given name
   */
  getObjectFromName(name: string): any {
    const sourceIndex = this.bindingArray.findIndex(
      (obj, index) => obj?.name === name || this.objectsLabels?.[index] === name
    );
    if (sourceIndex == -1) {
      throw new Error(`Name ${name} not found in binding array`);
    }
    return this.bindingArray[sourceIndex];
  }
  editBindingKeys(bindingKeys: string[]) {
    this.bindingKeys = bindingKeys;
  }
  /** ForEach element E in bindingArray,
   * update the properties of E whose keys are in bindingKeys,
   * with the properties of the element whose index matches sourceIndex */
  updateFromIndex(sourceIndex: number): any[] {
    if (sourceIndex < 0 || sourceIndex >= this.bindingArray.length) {
      throw new Error(`Source index ${sourceIndex} is out of bounds`);
    }
    this.bindingArray.forEach((obj, index) => {
      // update an object with the properties of the source object corresponding to the binding keys
      if (index != sourceIndex) {
        this.bindingKeys.forEach((bindingKey) => {
          const newObj = {
            ...obj,
            [bindingKey]: this.bindingArray[sourceIndex][bindingKey],
          };
          obj = newObj;
          this.bindingArray[index] = newObj;
        });
      }
    });
    return this.bindingArray;
  }
  /** ForEach element E in bindingArray,
   * update the properties of E whose keys are in bindingKeys,
   * with the properties of the element whose name matches sourceName */
  updateFrom(sourceName: string): any[] {
    const sourceIndex = this.bindingArray.findIndex(
      (obj, index) => obj?.name === sourceName || this.objectsLabels?.[index] === sourceName
    );
    if (sourceIndex == -1) {
      throw new Error(`Source name ${sourceName} not found in binding array`);
    }
    return this.updateFromIndex(sourceIndex);
  }
  /**
   * Update the objects in bindingArray using a given function f as follows:
   * for each object obj in bindingArray,
   * obj will be updated into a new object obj1 that has the same properties of obj, except
   * for properties with key k in bindingKeys, where it satisfies: obj1[k] = f(obj[k]).
   * */
  updateApplyFunction(f: (x: any) => any) {
    this.bindingArray.forEach((obj) =>
      this.bindingKeys.reduce((_obj, k) => {
        _obj[k] = f(obj[k]);
        return _obj;
      }, obj)
    );
  }
}

const bindingArray = [
  {
    name: "a",
    height: 1,
    width: 2,
  },
  {
    name: "b",
    height: 3,
    width: 4,
  },
  {
    name: "c",
    height: 5,
    width: 2,
  },
];

const binding = new PropertyBinder(bindingArray, ["width"]);
binding.updateApplyFunction((x) => x * 2);
binding.updateFrom("a");
binding.updateApplyFunction((x) => x + 1);
binding.editBindingKeys(["height"]);
binding.updateFrom("a");
console.log(binding.bindingArray, bindingArray);
