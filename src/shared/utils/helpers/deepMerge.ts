type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export const deepMerge = <T extends object>(target: T, source: DeepPartial<T>): T => {
  for (const key of Object.keys(source) as Array<keyof T>) {
      if (source[key] instanceof Object && key in target) {
          (target as any)[key] = deepMerge((target as any)[key], (source as any)[key]);
      } else {
          (target as any)[key] = source[key] as any;
      }
  }
  return target;
};