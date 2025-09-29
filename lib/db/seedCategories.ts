/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectToDatabase } from '.'
import Category from './models/category.model'
import { cwd } from 'process'
import { loadEnvConfig } from '@next/env'
import { categoriesData, CategorySeed } from '@/lib/categories' // import your categories file

loadEnvConfig(cwd())

const main = async () => {
  try {
    await connectToDatabase(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    await Category.deleteMany({})
    console.log('Cleared existing categories')

    const createdCategories = await createCategoryTree(categoriesData)
    console.log({
      createdCategories,
      message: 'Seeded categories successfully',
    })

    process.exit(0)
  } catch (error) {
    console.error(error)
    throw new Error('Failed to seed categories')
  }
}

// Recursive function to create categories and subcategories
async function createCategoryTree(
  data: CategorySeed[],
  parent: any = null
): Promise<any[]> {
  const result: any[] = []

  for (const cat of data) {
    const { subcategories, ...rest } = cat
    const newCategory = await Category.create({
      ...rest,
      parent: parent ? parent._id : null,
    })

    if (subcategories && subcategories.length > 0) {
      await createCategoryTree(subcategories, newCategory)
    }

    result.push(newCategory)
  }

  return result
}

main()
