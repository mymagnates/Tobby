export const emulatorPropertyFixture = {
  users: {
    pmA: 'pm-a',
    pmB: 'pm-b',
    viewer: 'viewer-a',
  },
  properties: {
    pmA: 'property-a',
    pmB: 'property-b',
  },
}

export async function seedPropertyAccessFixture(testEnv) {
  const { doc, setDoc } = await import('firebase/firestore')
  const { users, properties } = emulatorPropertyFixture

  await testEnv.withSecurityRulesDisabled(async (context) => {
    const admin = context.firestore()
    await Promise.all([
      setDoc(doc(admin, 'properties', properties.pmA), {
        address: '101 PM A Way',
        created_by_user_id: users.pmA,
        ownership_mode: 'managed_for_owner',
        owner_user_ids: [],
        manager_user_ids: [users.pmA],
        viewer_user_ids: [users.viewer],
        primary_owner_user_id: null,
      }),
      setDoc(doc(admin, 'properties', properties.pmB), {
        address: '202 PM B Way',
        created_by_user_id: users.pmB,
        ownership_mode: 'managed_for_owner',
        owner_user_ids: [],
        manager_user_ids: [users.pmB],
        viewer_user_ids: [],
        primary_owner_user_id: null,
      }),
    ])
  })
}
