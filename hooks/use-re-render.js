import { useCallback, useState } from "react";

const useReRender = () => {
  const [, reRender] = useState(false);
  const render = useCallback(() => {
    reRender((curr) => !curr);
  });
  return render;
};

export default useReRender;
