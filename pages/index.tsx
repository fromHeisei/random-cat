import { GetServerSideProps } from "next";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import styles from "./index.module.css";

// getserversidepropsから渡されるpropsの型
type Props = {
  initialImageUrl: string;
};

const IndexPage: NextPage<Props> = ({ initialImageUrl }) => {
  // usestateを使って状態を定義する
  const [imageUrl, setImageUrl] = useState<Image>({
    url: initialImageUrl,
    title: "",
    artist: "",
  });
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  // ボタンをクリックしたときに画像を読み込む処理
  const handleClick = async () => {
    setLoading(true); //読み込み中フラグを立てる
    const newImage = await fetchImage();
    setImageUrl(newImage);
    setLoading(false);
    setImageLoaded(true);
    console.log(newImage);
  };

  return (
    <div className={styles.page}>
      <button onClick={handleClick} className={styles.button}>
        作品生成ボタン
      </button>
      <div className={styles.frame}>
        {!imageLoaded ? (
          <p>読み込み中...</p>
        ) : (
          <>
            <img
              src={imageUrl.url}
              className={styles.img}
              onLoad={() => {
                setImageLoaded(true);
                setLoading(false);
              }}
            />
            <div className={styles.info}>
              <h2>{imageUrl.title}</h2>
              <p>アーティスト: {imageUrl.artist}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default IndexPage;

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const image = await fetchImage();

  return {
    props: {
      initialImageUrl: image.url,
    },
  };
};

type Image = {
  url: string;
  title: string;
  artist: string;
};

const fetchImage = async (): Promise<Image> => {
  // メトロポリタン美術館のAPIからランダムな作品を取得
  const res = await fetch(
    "https://collectionapi.metmuseum.org/public/collection/v1/objects"
  ); // 非同期
  const data = await res.json();
  const ids: number[] = data.objectIDs;

  let object;
  let attempts = 0;
  do {
    // ランダムなIDを選択
    const randomIndex = Math.floor(Math.random() * data.total);
    const objectId = data.objectIDs[randomIndex];

    // 選択したIDの作品の詳細を取得
    const objectRes = await fetch(
      `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`
    );
    object = await objectRes.json();
    attempts++;
  } while (!object.primaryImage && attempts < 10);

  return {
    url: object.primaryImage,
    title: object.title,
    artist: object.artistDisplayName || "不明",
  };
};
