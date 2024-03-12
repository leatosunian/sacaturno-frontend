import { useContext } from "react"
import { AuthContext } from "../app/context/authContext"

export const useAuth = () => {
    const { authState, saveAuthData, loading } = useContext(AuthContext)

    return {
        authState,
        saveAuthData,
        loading
    }

}