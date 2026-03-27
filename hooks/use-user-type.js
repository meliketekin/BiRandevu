import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebase";
import { RoleTypeEnum } from "@/enums/role-type-enum";

const useUserType = () => {
  const [state, setState] = useState({
    loading: true,
    userType: null,
    isAdmin: false,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setState({ loading: false, userType: null, isAdmin: false });
        return;
      }
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const { userType, isAdmin } = snap.data();
          setState({ loading: false, userType, isAdmin: !!isAdmin });
        } else {
          setState({ loading: false, userType: null, isAdmin: false });
        }
      } catch {
        setState({ loading: false, userType: null, isAdmin: false });
      }
    });

    return unsubscribe;
  }, []);

  return {
    loading: state.loading,
    userType: state.userType,
    isAdmin: state.isAdmin,
    isCustomer: state.userType === RoleTypeEnum.Customer,
    isBusiness: state.userType === RoleTypeEnum.Business,
    isBusinessOwner: state.userType === RoleTypeEnum.Business && state.isAdmin,
    isEmployee: state.userType === RoleTypeEnum.Business && !state.isAdmin,
  };
};

export default useUserType;
