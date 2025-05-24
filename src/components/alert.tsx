import React, { useEffect } from 'react'
import { Alert as BaseAlert, AlertIcon, Box, CloseButton } from '@chakra-ui/react'
import { AlertType, useAlert } from '../contexts/alert'

type AlertProps = {
  alert: AlertType,
}

export const Alert: React.FC<AlertProps> = ({ alert }) => {
  const { removeAlert } = useAlert()

  useEffect(() => {
    const timer = setTimeout(() => {
      removeAlert(alert.key)
    }, 5000)

    return () => clearTimeout(timer)
  }, [alert.key, removeAlert])

  return (
    <Box
      position="fixed"
      top="1rem"
      left="50%"
      transform="translateX(-50%)"
      zIndex={9999}
      width="auto"
      maxWidth="90vw"
      boxShadow="lg"
      borderRadius="md"
    >
      <BaseAlert
        status={ alert.severity }
      >
        <AlertIcon />
        <Box>
          { alert.message }
        </Box>
        <CloseButton
          alignSelf='flex-start'
          position='relative'
          right={-1}
          top={0}
          onClick={() => removeAlert(alert.key)}
        />
      </BaseAlert>
    </Box>
  )
}