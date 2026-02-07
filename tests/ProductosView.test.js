import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductosView from '../src/views/ProductosView.vue'

describe('ProductosView', () => {
  it('muestra los productos en la lista', () => {
    const wrapper = mount(ProductosView)
    const items = wrapper.findAll('li')
    expect(items.length).toBeGreaterThan(0)
    expect(items[0].text()).toContain('Laptop')
  })
})