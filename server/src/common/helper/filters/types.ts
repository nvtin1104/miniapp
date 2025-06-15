export type StringFieldOperator = {
    eq?: string;
    ne?: string;
    in?: string[];
    nin?: string[];
    regex?: string;
  };
  
  export type IntFieldOperator = {
    eq?: number;
    ne?: number;
    gt?: number;
    gte?: number;
    lt?: number;
    lte?: number;
    in?: number[];
    nin?: number[];
  };
  
  export type BooleanFieldOperator = {
    eq?: boolean;
    ne?: boolean;
  };
  
  export type GraphQLQueryFilter = {
    [field: string]: StringFieldOperator | IntFieldOperator | BooleanFieldOperator;
  };
  
  export type GraphQLFilterInput = {
    query: GraphQLQueryFilter;
  };
  