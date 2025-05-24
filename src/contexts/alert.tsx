import React, { createContext, useContext } from 'react'

export type AlertType = {
  severity: 'info' | 'success' | 'warning' | 'error',
  message: string,
  key: string,
}

type AlertContextType = {
  alerts: AlertType[],
  setAlerts: (alerts: AlertType[]) => void,
  addAlert: (alert: AlertType) => void,
  removeAlert: (key: string) => void,
}

const AlertContext = createContext<AlertContextType>({
  alerts: [],
  setAlerts: () => {
  },
  addAlert: () => {
  },
  removeAlert: () => {
  },
})

export const AlertProvider = ({
  children,
}: {
  children: React.ReactNode,
}) => {
  const [alerts, setAlerts] = React.useState<AlertType[]>([])
  const addAlert            = (alert: AlertType) => (
    !alerts.filter(oldAlert => oldAlert.key === alert.key).length && setAlerts([...alerts, alert])
  )
  const removeAlert         = (key: string) => setAlerts(alerts.filter(alert => alert.key !== key))

  return (
    <AlertContext.Provider value={ { alerts, setAlerts, addAlert, removeAlert } }>
      { children }
    </AlertContext.Provider>
  )
}

export const useAlert = () => {
  const context = useContext(AlertContext)

  if (!context) {
    throw new Error('useAlert must be used within AlertProvider')
  }

  return context
}
