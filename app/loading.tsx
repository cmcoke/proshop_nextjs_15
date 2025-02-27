/**
 * This component renders a full-screen loading spinner using an animated GIF from assets/loader.gif file.
 */

import Image from "next/image";
import loader from "@/assets/loader.gif";

const Loading = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw"
      }}
    >
      <Image src={loader} width={150} height={150} alt="Loading..." />
    </div>
  );
};

export default Loading;
