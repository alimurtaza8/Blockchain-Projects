// schemas/product.ts
import {Rule} from "sanity";

export default {
  name: 'equipment',
  title: 'Rental Equipment',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Equipment Name',
      type: 'string',
      validation: (rule: Rule) => rule.required().max(90)
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96
      },
      validation: (rule: Rule) => rule.required()
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: (rule: Rule) => rule.required().min(50).max(500)
    },
    {
      name: 'dailyRate',
      title: 'Daily Rate (ETH)',
      type: 'number',
      validation: (rule: Rule) => rule.required().min(0)
    },
    {
      name: 'securityDeposit',
      title: 'Security Deposit (ETH)',
      type: 'number',
      validation: (rule: Rule) => rule.required().min(0)
    },
    {
      name: 'nftAddress',
      title: 'NFT Contract Address',
      type: 'string',
      description: 'Will be populated after NFT minting',
      validation: (rule: Rule) => rule.required()
    },
    {
      name: 'tokenId',
      title: 'NFT Token ID',
      type: 'string',
      description: 'Unique identifier for the NFT',
      validation: (rule: Rule) => rule.required()
    },
    {
      name: 'images',
      title: 'Equipment Images',
      type: 'array',
      of: [{ type: 'image' }],
      validation: (rule: Rule) => rule.required().min(1)
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          'Camera Gear',
          'Drones',
          'Audio Equipment',
          'Lighting',
          'Other'
        ]
      }
    },
    {
      name: 'blockchainData',
      title: 'Blockchain Data',
      type: 'object',
      fields: [
        { name: 'nftAddress', type: 'string', title: 'NFT Contract Address' },
        { name: 'tokenId', type: 'string', title: 'NFT Token ID' },
        { name: 'rentalContract', type: 'string', title: 'Rental Contract Address' }
      ]
    },
  ]
}