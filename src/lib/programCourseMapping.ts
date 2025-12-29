// Mapping between program slugs and course IDs in the database
export const programToCourseId: Record<string, string> = {
  'workshop-ia': 'c0000001-0001-0000-0000-000000000001',
  'experience-start': 'c0000001-0002-0000-0000-000000000002',
  'aceleracao': 'c0000001-0003-0000-0000-000000000003',
  'mentoria-360': 'c0000001-0004-0000-0000-000000000004',
  'elite': 'c0000001-0005-0000-0000-000000000005',
};

export const getCourseIdByProgramSlug = (slug: string): string | undefined => {
  return programToCourseId[slug];
};
