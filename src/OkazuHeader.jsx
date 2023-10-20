import styled from "styled-components";

export default function OkazuHeader() {
  return (
    <>
      <SHeader>
        <div>
          <h1>おかずを選んでオリジナル弁当を作ろう</h1>
        </div>
      </SHeader>
    </>
  );
}

const SHeader = styled.header`
  color: #dc143c;
  font-family: "M PLUS Rounded 1c";
`;
