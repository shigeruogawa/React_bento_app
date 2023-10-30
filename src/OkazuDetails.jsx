import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function OkazuDetails() {
  console.log("details発火");

  const { okazuId } = useParams();
  console.log(okazuId);
  const [okazu, setOkazu] = useState();

  const uri = `${process.env.REACT_APP_API_BASE_PATH}/sidedishes/${okazuId}`;
  console.log(uri);

  useEffect(() => {
    axios
      .get(uri)
      .then((response) => {
        console.log("おかず詳細の取得に成功しました。");
        console.log(response.data);
        setOkazu(response.data);
      })
      .catch((error) => {
        console.log("おかず詳細の取得に失敗しました。");
        console.log(error);
      });
  }, [uri]);

  return (
    <>
      {okazu ? (
        <>
          <p>{okazu.name}</p>
          <input value={okazu.id} type="text" />
          <p>{okazu.price}</p>
          <p>{okazu.genreName}</p>
        </>
      ) : (
        <p>おかずを取得中。</p>
      )}
    </>
  );
}
