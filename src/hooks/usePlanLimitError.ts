import { useState } from 'react'

export interface PlanLimitErrorState {
  error: any;
  isVisible: boolean;
}

export const usePlanLimitError = () => {
  const [planLimitError, setPlanLimitError] = useState<any>(null)
  const [showPlanLimitToast, setShowPlanLimitToast] = useState(false)

  const handlePlanLimitError = (error: any) => {
    setPlanLimitError(error)
    setShowPlanLimitToast(true)
  }

  const clearPlanLimitError = () => {
    setShowPlanLimitToast(false)
    setPlanLimitError(null)
  }

  const checkAndHandlePlanLimitError = async (response: Response): Promise<boolean> => {
    if (response.status === 403) {
      try {
        const errorData = await response.text()
        const errorJson = JSON.parse(errorData)
        handlePlanLimitError(errorJson)
        return true // Indicates this was a plan limit error
      } catch (parseError) {
        // If JSON parsing fails, it's not a plan limit error
        return false
      }
    }
    return false // Not a plan limit error
  }

  return {
    planLimitError,
    showPlanLimitToast,
    handlePlanLimitError,
    clearPlanLimitError,
    checkAndHandlePlanLimitError
  }
}
