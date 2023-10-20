import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
// 永続化のため
// import { createStore, applyMiddleware } from "redux";
// import { persistStore, persistReducer } from "redux-persist";
// import storage from "redux-persist/lib/storage";
// import rootReducer from "./reducers";
import { store } from "./state/StateManager";

export function OkazuIndex() {
  // 初回ディスパッチ
  store.dispatch({
    type: "test",
  });

  const currentState = store.getState();

  console.log(currentState);

  const okazu = currentState.okazuReducer.test;

  // おかず一覧
  const [okazuList, setOkazuList] = useState(null);
  // 選択中のおかず一覧
  const [okazuInCartList, setOkazuInCartList] = useState([]);
  // 登録後の弁当
  const [bentoRegisteredList, setBentoRegisteredList] = useState([]);
  // 弁当登録押下フラグ
  const [bentoRegistered, isBentoRegistered] = useState(false);
  // 弁当購入ボタン押下フラグ
  const [bentoPurchased, isBentoPurchased] = useState(null);
  // 弁当購入結果
  const [bentoPurchaseResult, setBentoPurchaseResult] = useState(null);
  // 注文明細出力フラグ
  const [bentoDetailsOutputFlag, setBentoDetailsOutputFlag] = useState(false);
  // 注文確定明細
  const [bentoPurchaseDetails, setBentoPurchaseDetails] = useState([]);

  function onCkickOkazuAdd(id, name, price) {
    console.log("おかず追加直前");
    console.log(store.getState());
    store.dispatch({
      type: "okazu-added",
      payload: {
        id: id,
        name: name,
        price: price,
      },
    });

    setOkazuInCartList(store.getState().okazuReducer.okazu_added);
    // setBentoPurchaseResult("");
    // const okazuInCart = [...okazuInCartList];
    // okazuInCart.push({ id: id, name: name, price: price });
    // setOkazuInCartList(okazuInCart);
  }

  useEffect(() => {
    if (!bentoDetailsOutputFlag) {
      return;
    }

    setBentoPurchaseDetails([...bentoPurchaseDetails, ...bentoRegisteredList]);

    setBentoRegisteredList([]);

    setBentoDetailsOutputFlag(false);
  }, [bentoDetailsOutputFlag]);

  useEffect(() => {
    if (!bentoRegistered) {
      return;
    }

    setBentoPurchaseResult("");
    // 弁当登録情報設定
    const okazuPriceSum = okazuInCartList.reduce(
      (sum, okazu) => sum + okazu.price,
      0
    );

    const okazuIds = okazuInCartList.map((okazu) => okazu.id);

    const registerBento = {
      bentoBoxId: 1,
      totalPrice: okazuPriceSum,
      userId: 1,
      riceId: 1,
      sidedisheIds: okazuIds,
    };

    axios
      .post("http://localhost:8081/stock/bentoes/register", registerBento)
      .then((response) => {
        setBentoRegisteredList([...bentoRegisteredList, response.data]);
        isBentoRegistered(!isBentoRegistered);

        // 選択中のおかずリストリセット
        setOkazuInCartList([]);
      })
      .catch((error) => {
        console.log("お弁当の登録に失敗しました。");
        console.log(error);
      });

    isBentoRegistered(false);
  }, [bentoRegistered]);

  useEffect(() => {
    axios
      .get("http://localhost:8081/stock/sidedishes")
      .then((response) => {
        setOkazuList(response.data);
      })
      .catch((error) => {});
  }, []);

  useEffect(() => {
    if (!bentoPurchased) {
      return;
    }

    let bentoPurchaseForm;
    let bentoPurchaseList = [];

    for (let bento of bentoRegisteredList) {
      bentoPurchaseList.push({ bentoId: bento.id, count: 1 });
    }

    bentoPurchaseForm = {
      orders: bentoPurchaseList,
    };

    setBentoPurchaseResult("注文送信中...");

    axios
      .post("http://localhost:8081/stock/order/confirm", bentoPurchaseForm)
      .then((response) => {
        console.log("弁当注文完了");
        console.log(response.data);
        if (response.data.possibleOrder) {
          console.log("通信成功");
          setBentoPurchaseResult("注文が完了しました。");

          setBentoDetailsOutputFlag(true);
        } else {
          console.log("通信失敗");
          setBentoPurchaseResult("注文に失敗しました。");
        }
        isBentoPurchased(!bentoPurchased);
      })
      .catch((error) => {
        setBentoPurchaseResult("注文に失敗しました。");
        console.log(error);
      });
  }, [bentoPurchased]);

  return (
    <>
      <p>reduxテスト</p>
      <div>
        {okazu.map((okazu) => {
          return <p>{okazu}</p>;
        })}
      </div>
      <SContent>
        <SOkazuMenu>
          <STitle>選択中のおかず</STitle>
          <div id="okazu-in-cart">
            <table>
              {okazuInCartList.length >= 1 ? (
                okazuInCartList.map((okazu) => {
                  return (
                    <SOkazuInCart key={okazu.id}>
                      {okazu.name}:{okazu.price}円
                    </SOkazuInCart>
                  );
                })
              ) : (
                <STitle>おかずを選択してください。</STitle>
              )}
            </table>
            <p>
              <SButton
                onClick={() => {
                  isBentoRegistered(true);
                }}
              >
                登録
              </SButton>
            </p>
          </div>

          <div id="bento-registered">
            <STitle>カスタムした弁当</STitle>
            {bentoRegisteredList
              ? bentoRegisteredList.map((bento) => {
                  return (
                    <React.Fragment key={bento.id}>
                      <SBentoHeader>弁当{bento.id}</SBentoHeader>
                      <p>選んだおかず : {bento.sidedisheNames.join("/")}</p>
                      <hr />
                    </React.Fragment>
                  );
                })
              : "登録した弁当はありません。"}
            <SButton
              onClick={() => {
                isBentoPurchased(!bentoPurchased);
              }}
            >
              購入
            </SButton>
            <SPurchaseResult>
              {bentoPurchaseResult ? bentoPurchaseResult : ""}
            </SPurchaseResult>
          </div>
        </SOkazuMenu>
        <SBentoDetails>
          {bentoPurchaseDetails.length >= 1 ? (
            bentoPurchaseDetails.map((details) => {
              return (
                <>
                  <p>弁当id:{details.bentoId}</p>
                  <p>金額: {details.price}</p>
                  <p>おかず:{details.sidedisheNames.join("/")}</p>
                  <hr />
                </>
              );
            })
          ) : (
            <p>まだ注文はありません。</p>
          )}
        </SBentoDetails>
      </SContent>

      <STitle>おかず一覧</STitle>
      <SOkazuArea>
        {okazuList ? (
          okazuList.map((okazu) => {
            return (
              <SOkazuTile key={okazu.id}>
                <input type="hidden" value={okazu.id} />
                <p>{okazu.genreName}</p>

                <p>
                  <img
                    src={`http://localhost:3000/image/okazu/${okazu.imageFile}`}
                    alt="おかず画像"
                    width="100"
                    height="100"
                  />
                </p>

                <Link to={`/okazu/${okazu.id}`}>{okazu.name}</Link>
                <p>{okazu.price}円(税込み)</p>
                <SButton
                  onClick={() => {
                    onCkickOkazuAdd(okazu.id, okazu.name, okazu.price);
                  }}
                >
                  お弁当に追加
                </SButton>
              </SOkazuTile>
            );
          })
        ) : (
          <STitle>おかずを取得中...</STitle>
        )}
      </SOkazuArea>
    </>
  );
}

const SOkazuInCart = styled.tr`
  border: solid 1px #000;
  clear: both;
  &:nth-child(odd) {
    background-color: aquamarine;
  }

  &:nth-child(even) {
    background-color: #fffacd;
  }
`;

const STitle = styled.h3`
  color: #4169e1;
`;

const SBentoHeader = styled.p`
  display: inline-block;
  border-radius: 7px;
  padding: 5px;
  background-color: #ffc0cb;
`;

const SOkazuArea = styled.div`
  width: 90%;
  height: auto;
  background-color: #fff8dc;

  &:after {
    content: "";
    display: table;
    clear: both;
  }
`;

const SOkazuTile = styled.div`
  width: 20%;
  padding: 25px;
  margin: 20px;
  border: 4px solid black;
  border-radius: 30px;
  background-color: #f0f8ff;
  float: left;
`;

const SButton = styled.button`
  border-radius: 10px;
  background-color: #fff0f5;
  &:hover {
    background-color: #ffe4e1;
  }
`;

const SPurchaseResult = styled.p`
  color: #ff0000;
`;

const SOkazuMenu = styled.div`
  display: inline-block;
`;
const SBentoDetails = styled.div`
  height: auto;
  margin-left: 700px;
  background-color: blue;
  display: inline-block;
`;

const SContent = styled.div`
  display: flex;
  background-color: aqua;
`;

export default OkazuIndex;
