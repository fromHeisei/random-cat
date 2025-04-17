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
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [loading, setLoading] = useState(true);
  // 更新時に画像を読み込む
  useEffect(() => {
    fetchImage().then((newImage) => {
      setImageUrl(newImage.url);
      setLoading(false);
    });
  }, []);
  // ボタンをクリックしたときに画像を読み込む処理
  const handleClick = async () => {
    setLoading(true); //読み込み中フラグを立てる
    const newImage = await fetchImage();
    setImageUrl(newImage.url);
    setLoading(false);
  };
  return (
    <div className={styles.page}>
      <button onClick={handleClick} className={styles.button}>
        にゃんこ生成ボタン
      </button>
      <div className={styles.frame}>
        {loading || <img src={imageUrl} className={styles.img} />}
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
};

const fetchImage = async (): Promise<Image> => {
  const res = await fetch("https://api.thecatapi.com/v1/images/search");
  const images = await res.json();
  console.log(images);
  return images[0];
};
