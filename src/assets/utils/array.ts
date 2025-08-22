import { MAX_SIZE } from "../configs/app.constant";

export const pipe = (...fns: any) => (x: any) => fns.reduce((v: any, f: any) => f(v), x);
export const wait = async (time: any) => await new Promise(r => setTimeout(r, time));
export const targetBelongToSource = (source: any, target: any) => target.every((v: any) => source.includes(v))
export const targetHaveValueInSource = (source: any, target: any) => target.find((v: any) => source.includes(v))
export const uniqueArray = (array: any) => array.filter((item: any, idx: any) => array.indexOf(item) == idx)
export const arrayDifference = (arr1: any, arr2: any) => arr1.filter((x: any) => !arr2.includes(x));
export const arrayIntersection = (arr1: any, arr2: any) => arr1.filter((x: any) => arr2.includes(x));

export const sliceIntoChunks = (arr: Array<any>, chunkSize: number = MAX_SIZE) => {
  const res = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
      const chunk = arr.slice(i, i + chunkSize);
      res.push(chunk);
  }
  return res;
}

export const arrayWalk = async (data: any[], callback: Function) => {
  if (Array.isArray(data) && data.length > 0) {
    const element = data.pop();
    await callback(element);
    return arrayWalk(data, callback)
  } else {
    return
  }
}