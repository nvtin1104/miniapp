// build-mongo-query.ts
export const buildMongoQuery = <T extends Record<string, any>>(filter: T): Record<string, any> => {
    const mongoQuery: Record<string, any> = {};
  
    if (!filter) return mongoQuery;
  
    for (const [field, operator] of Object.entries(filter)) {
      if (!operator) continue;
      const fieldQuery: Record<string, any> = {};
  
      if ('eq' in operator && operator.eq !== undefined) fieldQuery.$eq = operator.eq;
      if ('ne' in operator && operator.ne !== undefined) fieldQuery.$ne = operator.ne;
      if ('gt' in operator && operator.gt !== undefined) fieldQuery.$gt = operator.gt;
      if ('gte' in operator && operator.gte !== undefined) fieldQuery.$gte = operator.gte;
      if ('lt' in operator && operator.lt !== undefined) fieldQuery.$lt = operator.lt;
      if ('lte' in operator && operator.lte !== undefined) fieldQuery.$lte = operator.lte;
      if ('in' in operator && operator.in?.length) fieldQuery.$in = operator.in;
      if ('nin' in operator && operator.nin?.length) fieldQuery.$nin = operator.nin;
      if ('regex' in operator && operator.regex) fieldQuery.$regex = new RegExp(operator.regex, 'i');
  
      if (Object.keys(fieldQuery).length > 0) {
        mongoQuery[field] = fieldQuery;
      }
    }
  
    return mongoQuery;
  };
  