import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
// 永続化のため
import { store } from "./state/StateManager";

export function OkazuIndex() {
  console.log("マウント");
  // 初回ディスパッチ
  store.dispatch({
    type: "test",
  });

  // 初回起動
  store.dispatch({
    type: "first",
  });

  const okazu = store.getState().okazuReducer.test;

  // おかず一覧
  const [okazuList, setOkazuList] = useState(null);
  // おかず選択フラグ
  const [okazuSelected, isOkazuSelected] = useState(false);
  // 選択中のおかず一覧
  const [okazuInCartList, setOkazuInCartList] = useState([
    { id: 1, name: "唐揚げ", price: 300 },
    { id: 2, name: "レバニラ", price: 300 },
  ]);

  // 弁当登録フラグ
  const [bentoRegistered, isBentoRegistered] = useState(false);
  // 登録した弁当一覧 id,name,price,sidedisheNames[]
  const [bentoesRegistered, setBentoesRegistered] = useState([]);
  // 弁当登録後のメッセージ
  const [bentoRegisterMessage, setBentoRegisterMessage] = useState("");

  // 弁当購入フラグ
  const [bentoPurchased, isBentoPurchased] = useState(false);

  // 弁当購入成功フラグ
  const [bentoPurchaseSuccess, setBentoPurchaseSuccess] = useState(false);

  // 購入した弁当一覧
  const [bentoPurchaseDetails, setBentoPurchaseDetails] = useState([]);

  // 弁当購入結果メッセージ
  const [bentoPurchaseResult, setBentoPurchaseResult] = useState("");

  // おかず一覧取得
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_BASE_PATH}/sidedishes`)
      .then((response) => {
        setOkazuList(response.data);
      })
      .catch((error) => {});
  }, []);

  // おかずを選択
  function onClickOkazuAdd(id, name, price) {
    isOkazuSelected(!okazuSelected);

    store.dispatch({
      type: "okazu-selected",
      payload: {
        id: id,
        name: name,
        price: price,
      },
    });
  }

  // おかず変更フラグにより、選択中のおかず一覧を更新
  useEffect(() => {
    setOkazuInCartList(store.getState().okazuReducer.okazu_selected);
  }, [okazuSelected]);

  function onClickBentoRegister() {
    const bentoRegisterForm = {
      bentoBoxId: 1,
      totalPrice: 0,
      userId: 1,
      riceId: 1,
      sidedisheIds: [],
    };
    // おかず合計額算出
    const okazuPriceList = store
      .getState()
      .okazuReducer.okazu_selected.map((okazu) => {
        return okazu.price;
      });
    bentoRegisterForm.totalPrice = okazuPriceList.reduce((a, b) => a + b);

    // おかずIDリスト取得
    const okazuIds = store
      .getState()
      .okazuReducer.okazu_selected.map((okazu) => okazu.id);
    bentoRegisterForm.sidedisheIds = okazuIds;

    axios
      .post(
        `${process.env.REACT_APP_API_BASE_PATH}/bentoes/register`,
        bentoRegisterForm
      )
      .then((response) => {
        console.log("弁当登録成功");
        console.log(response.data);

        store.dispatch({
          type: "bento-registered",
          payload: {
            id: response.data.id,
            name: response.data.name,
            price: response.data.price,
            sidedisheNames: store
              .getState()
              .okazuReducer.okazu_selected.map((okazu) => okazu.name),
          },
        });
        isBentoRegistered(!bentoRegistered);
        // 選択おかずが更新されるので再描画させる
        isOkazuSelected(!okazuSelected);
      })
      .catch((error) => {
        isBentoRegistered(!bentoRegistered);
      });
  }

  useEffect(() => {
    if (!isBentoRegistered) {
      setBentoRegisterMessage("弁当登録に失敗しました。");
      return;
    }
    setBentoRegisterMessage("弁当登録に成功しました。");

    setBentoesRegistered(store.getState().okazuReducer.bento_registered);
  }, [bentoRegistered]);

  function onClickBentoPurchase() {
    const bentoPurchaseForm = {
      orders: [],
    };

    console.log("購入元情報");
    console.log(store.getState().okazuReducer.bento_registered);

    bentoPurchaseForm.orders = store
      .getState()
      .okazuReducer.bento_registered.map((bento) => {
        return {
          bentoId: bento.id,
          count: 1,
        };
      });

    console.log("注文フォーム");
    console.log(bentoPurchaseForm);

    axios
      .post(
        `${process.env.REACT_APP_API_BASE_PATH}/order/confirm`,
        bentoPurchaseForm
      )
      .then((response) => {
        console.log("購入成功");
        console.log(response.data);

        if (response.data.possibleOrder) {
          console.log("購入TRUE");
          store.dispatch({
            type: "bento-purchased",
          });
          isBentoPurchased(!bentoPurchased);
        }
      })
      .catch((error) => {
        console.log("購入失敗");
        console.log(error);
      });
  }

  useEffect(() => {
    console.log("購入後後処理");
    console.log(store.getState());
    setBentoPurchaseSuccess(!bentoPurchaseSuccess);
  }, [bentoPurchased]);

  useEffect(() => {
    console.log("弁当明細表示");

    setBentoPurchaseDetails(store.getState().okazuReducer.bento_purchased);
    store.dispatch({
      type: "bento-purchased-clear",
    });

    setBentoesRegistered(store.getState().okazuReducer.bento_registered);
  }, [bentoPurchaseSuccess]);

  return (
    <>
      <p>reduxテスト</p>
      <div>
        {okazu.map((okazu) => {
          return <p key={okazu.id}>{okazu}</p>;
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
                    <table key={okazu.id}>
                      <SOkazuInCart>
                        {okazu.name}:{okazu.price}円
                      </SOkazuInCart>
                    </table>
                  );
                })
              ) : (
                <STitle>おかずを選択してください。</STitle>
              )}
            </table>
            <p>
              <SButton onClick={onClickBentoRegister}>登録</SButton>
            </p>
          </div>

          <div id="bento-registered">
            <STitle>カスタムした弁当</STitle>
            {bentoesRegistered.length >= 1
              ? bentoesRegistered.map((bento) => {
                  return (
                    <React.Fragment key={bento.id}>
                      <SBentoHeader>弁当{bento.id}</SBentoHeader>
                      <p>選んだおかず : {bento.sidedisheNames.join("/")}</p>
                      <p>お値段: {bento.price}円</p>
                      <hr />
                    </React.Fragment>
                  );
                })
              : "登録した弁当はありません。"}
            <SButton onClick={onClickBentoPurchase}>購入</SButton>
            <SPurchaseResult>
              {bentoPurchaseResult ? bentoPurchaseResult : ""}
            </SPurchaseResult>
          </div>
        </SOkazuMenu>
        <SBentoDetails>
          {bentoPurchaseDetails.length >= 1 ? (
            bentoPurchaseDetails.map((details) => {
              return (
                <div key={details.id}>
                  <p>弁当id:{details.id}</p>
                  <p>金額: {details.price}</p>
                  <p>おかず:{details.sidedisheNames.join("/")}</p>
                  <hr />
                </div>
              );
            })
          ) : (
            <p>購入した弁当はありません。</p>
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
                    src={`${process.env.REACT_APP_IMG_BASE_PATH}/image/okazu/${okazu.imageFile}`}
                    alt="おかず画像"
                    width="100"
                    height="100"
                  />
                </p>

                <Link to={`/okazu/${okazu.id}`}>{okazu.name}</Link>
                <p>{okazu.price}円(税込み)</p>
                <SButton
                  onClick={() => {
                    onClickOkazuAdd(okazu.id, okazu.name, okazu.price);
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
