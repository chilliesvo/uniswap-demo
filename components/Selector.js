import React, { useEffect, useState } from 'react'

import { Dropdown } from '@nextui-org/react'
import {
  UNI,
  DEFAULT_VALUE,
  WETH,
} from '../utils/SupportedCoins'

const Selector = ({ defaultValue, ignoreValue, setToken, id }) => {
  const menu = [
    { key: WETH, name: WETH },
    { key: UNI, name: UNI },
  ]

  const [selectedItem, setSelectedItem] = useState()
  const [menuItems, setMenuItems] = useState(getFilteredItems(ignoreValue))

  function getFilteredItems(ignoreValue) {
    return menu.filter(item => item['key'] !== ignoreValue)
  }

  useEffect(() => {
    setSelectedItem(defaultValue)
  }, [defaultValue])

  useEffect(() => {
    setMenuItems(getFilteredItems(ignoreValue))
  }, [ignoreValue])

  return (
    <Dropdown>
      <Dropdown.Button
        css={{
          backgroundColor:
            selectedItem === DEFAULT_VALUE ? '#2172e5' : '#2c2f36',
        }}
      >
        {selectedItem}
      </Dropdown.Button>
      <Dropdown.Menu
        aria-label='Dynamic Actions'
        items={menuItems}
        onAction={key => {
          setSelectedItem(key)
          setToken(key)
        }}
      >
        {item => (
          <Dropdown.Item
            aria-label={id}
            key={item.key}
            color={item.key === 'delete' ? 'error' : 'default'}
          >
            {item.name}
          </Dropdown.Item>
        )}
      </Dropdown.Menu>
    </Dropdown>
  )
}
export default Selector
