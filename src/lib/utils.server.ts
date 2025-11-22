import crypto from "node:crypto";

export const getSafeFilename = (name: string) => {
  // 获取后缀，将文件名称 md5 化
  const ext = name.split(".").pop();
  const hash = crypto.createHash("md5").update(name).digest("hex");
  return `${hash}.${ext}`;
};
