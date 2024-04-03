import { useSpring } from '@react-spring/web'
  //  元素移入动效函数
export const ShuttleAnimation = (direction: 'x' | 'y', from: number, to: number=0, delay: number) => {
    return useSpring({
        from: { [direction]: from },
        to: { [direction]: to },
        delay: delay
    })
}

export const FadeInAnimation = () => {
    return useSpring({
        from: { opacity: 0 },
        to: { opacity: 1 },
        delay:200,
    })
}

export const RotateAnimation = (canDo:boolean) => {
    return useSpring({
        from: {  transform: 'rotateX(90deg) rotateY(90deg)'},
        to: canDo&&{ transform: 'rotateX(0deg) rotateY(0deg)' },
        delay:50,
    })
}