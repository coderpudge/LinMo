var map_gen = require("map_gen");
cc.Class({
    extends: cc.Component,

    properties: {
        //描摹的画笔
        graphicsNode: {
            default: null,
            type: cc.Node,
            tooltip: '用来描摹的画笔'
        },

        //在那个区域描摹
        guijiNode: {
            default: null,
            type: cc.Node,
            tooltip: '轨迹所在区域'
        },
        map: {
            type: map_gen,
            default: null,
        },
    },


    onLoad() {
        let miaomoNum = 2;//描摹2

        //获取描摹2需要的轨迹点
        this.roundArr = this.map.get_road_set();
        this.roundIdx = 0;
        // this.arr = this.guijiNode.getComponent("guiji").getXYPoints(miaomoNum);
        this.arr = this.roundArr[this.roundIdx];
    },

    //设置箭头方向（包括描摹过程中箭头的方向）
    initAngle() {
        let angle = this.getAngle(this.arr[0].x, this.arr[0].y, this.arr[2].x, this.arr[2].y);
        this.node.rotation = -angle;
    },

    start() {
        
        if (this.arr.length === 0) {
            return
        }
        this.initAngle();
        this.init();
    },
    init() {
        let node = this.node;
        node.x = this.arr[0].x;
        node.y = this.arr[0].y;

        this.gameOver = false;
        this.arrIndex = 0;


        node.on(cc.Node.EventType.TOUCH_START, (event) => {
            this.touchBegin = true
        }, node);

        node.on(cc.Node.EventType.TOUCH_MOVE, (event) => {
            if (!this.touchBegin) {
                return
            }

            let nodeWorldPos = this.node.parent.convertToWorldSpaceAR(cc.v2(this.node.x, this.node.y));
            let position = event.touch.getLocation();
            cc.log("position" + position.x, position.y);
            cc.log("nodeWorldPos" + nodeWorldPos.x, nodeWorldPos.y);

            this.move(cc.v2(position.x - nodeWorldPos.x, position.y - nodeWorldPos.y));
        }, node);

        node.on(cc.Node.EventType.TOUCH_END, (event) => {
            this.touchBegin = false
        }, node);
    },


    //箭头复原动画
    interruptAnm(position) {
        let action = cc.sequence(
            cc.moveBy(0.2, position.x, position.y),
            cc.moveBy(0.2, -position.x, -position.y)
        );
        this.node.runAction(action);
    },

    //获取描摹过程中，箭头要跟着轨迹旋转的角度let
    getAngle(x1, y1, x2, y2) {
        // 直角的边长
        let x = Math.abs(x1 - x2);
        let y = Math.abs(y1 - y2);
        let z = Math.sqrt(x * x + y * y);
        let angle = Math.round((Math.asin(y / z) / Math.PI * 180));


        if (y2 > y1 && x2 < x1) {
            angle = 180 - angle
        } else if (y2 < y1 && x2 < x1) {
            angle = 180 + angle
        } else if (y2 < y1 && x2 > x1) {
            angle = 360 - angle
        }
        return angle;
    },

    //根据轨迹坐标点描摹
    move(position) {
        if (this.gameOver) {
            cc.log("游戏已经结束，顺利的描摹出来2了 !!!");
            return
        }
        let dx = position.x + this.node.x;
        let dy = position.y + this.node.y;

        let node_d = (position.x) * (position.x) + (position.y) * (position.y)
        if (node_d > 120 * 120) {
            cc.log(" Beyond the scope Beyond the scope Beyond the scope ")
            this.interruptAnm(position);
            this.touchBegin = false;
            return
        }

        let range = 20;
        let distance = 20;
        let max = this.arrIndex + range;
        if (max >= this.arr.length) {
            // this.touchBegin = false
            // this.gameOver = true
            // cc.log("game over ")
            // return
            max = this.arr.length
        }
        for (let index = this.arrIndex; index < max; index++) {
            // let index = max
            const element = this.arr[index];
            // cc.log("index  "+index)
            let d = (dx - element.x) * (dx - element.x) + (dy - element.y) * (dy - element.y)
            if (d < distance * distance) {
                this.graphicsNode.getComponent('mmGraphics').setPos(this.roundIdx,index);
                this.arrIndex = index;
                this.node.x = element.x;
                this.node.y = element.y;

                if (index === this.arr.length - 1) {
                    // this.drawEnd()
                    this.nextStep();
                } else {
                    let angle = this.getAngle(this.arr[index].x, this.arr[index].y, this.arr[index + 1].x, this.arr[index + 1].y);
                    this.node.rotation = -angle;
                }
            }
        }
    },

    nextStep(){
        this.roundIdx++;
        if (this.roundIdx > this.roundArr.length -1) {
            this.roundIdx = 0;
            this.drawEnd();
        }else{
            this.touchBegin = false
            this.arr = this.roundArr[this.roundIdx];
            let node = this.node;
            node.x = this.arr[0].x;
            node.y = this.arr[0].y;
            this.initAngle();
            this.gameOver = false;
            this.arrIndex = 0;
        }
    },

    //描摹完成
    drawEnd() {
        this.touchBegin = false;
        this.gameOver = true;

        this.scheduleOnce(() => {

            this.graphicsNode.getComponent('mmGraphics').clearDraw();

            this.arr = this.roundArr[this.roundIdx];
            let node = this.node;
            node.x = this.arr[0].x;
            node.y = this.arr[0].y;

            this.gameOver = false;
            this.arrIndex = 0;
            this.initAngle()


        }, 2);
    },

});
