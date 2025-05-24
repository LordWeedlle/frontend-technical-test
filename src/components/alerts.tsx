import React from 'react'
import { Box } from '@chakra-ui/react'
import { Alert } from './alert'
import { useAlert } from '../contexts/alert'

export const Alerts: React.FC = () => {
  const { alerts } = useAlert()

  return alerts.length
    ? <Box>
      { alerts?.map(alert => <Alert alert={ alert } key={ alert.key } />) }
    </Box>
    : null
}