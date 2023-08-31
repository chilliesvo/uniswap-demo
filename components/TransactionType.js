import React, { useEffect, useState } from 'react'

import { Dropdown } from '@nextui-org/react'
import { OX_API, STANDARD } from '../utils/SupportedTransactions'

const TransactionType = ({ defaultValue, id }) => {
  const menu = [
    { key: STANDARD, name: STANDARD },
    { key: OX_API, name: OX_API },
  ]

  const [selectedItem, setSelectedItem] = useState()
  const [menuItems, setMenuItems] = useState(menu)

  useEffect(() => {
    setSelectedItem(defaultValue)
  }, [defaultValue])

  useEffect(() => {
    setMenuItems(menu)
  }, [])

  return (
    <Dropdown>
      <Dropdown.Button
        css={{
          backgroundColor: '#222429',
        }}
      >
        {selectedItem}
      </Dropdown.Button>
      <Dropdown.Menu
        aria-label='Dynamic Actions'
        items={menuItems}
        onAction={key => {
          setSelectedItem(key)
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
export default TransactionType
