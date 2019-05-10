cc.Class({
    extends: cc.Component,

    properties: {
        touchNode: {
            default: null,
            type: cc.Node,
            tooltip: '绘制点（箭头）'
        },

        guijiNode: {
            default: null,
            type: cc.Node,
            tooltip: '描摹区域'
        },
        isMiaoMobg: {
            default: false,
            type: Boolean,
            tooltip: '是否作为描摹的底层'
        },
        isAudioGetGj: {
            default: false,
            type: Boolean,
            tooltip: '是否能自动描摹获取轨迹坐标点'
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        console.log(this.guijiNode);
        let miaomoNum = 2;
        // alert(1);
        this.arr = this.guijiNode.getComponent("guiji").getXYPoints(miaomoNum);
        this.roundArr = this.guijiNode.getComponent("guiji").map.get_road_set();
        this.gj = this.guijiNode.getComponent("guiji").getGj(miaomoNum);
    },


    start() {
        cc.log("画笔开始绘制");
        this.graphics = this.getComponent(cc.Graphics);
        let lv = 1;

        if (this.isMiaoMobg) {//绘制描摹底部
            /* for (let index = 0; index < this.gj.length; index++) {
                const element = this.gj[index];
                if (element.type === "moveto") {
                    this.graphics.moveTo(element.point01.x, element.point01.y);
                } else if (element.type === "bezier") {
                    this.graphics.bezierCurveTo(element.point01.x, element.point01.y, element.point02.x, element.point02.y, element.point03.x, element.point03.y);
                } else if (element.type === "lineto") {
                    this.graphics.lineTo(element.point01.x, element.point01.y)
                }
            } */
            for (let i = 0; i < this.roundArr.length; i++) {
                let locus = this.roundArr[i];
                for (let j = 0; j < locus.length - 1; j++) {
                    const elementold = locus[j];
                    const elementnew = locus[j + 1 ];
        
                    this.graphics.moveTo(elementold.x, elementold.y);
        
                    this.graphics.lineTo(elementnew.x, elementnew.y);
        
                    this.graphics.stroke();
                    this.graphics.fill();
                    
                }
            }
            this.graphics.stroke();
        } else {
            if (this.isAudioGetGj) {
                this.actionRun = true;
                this.index = 0;
                this.loadArr = [];

                this.touchNode.x = this.gj[0].point01.x;
                this.touchNode.y = this.gj[0].point01.y;

                let seq = cc.callFunc(() => {

                }, this);

                for (let index = 0; index < this.gj.length; index++) {
                    const element = this.gj[index];
                    if (element.type === "moveto") {
                        cc.log("moveto: " + element.point01.x + "   " + element.point01.y)
                    } else if (element.type === "bezier") {
                        let bezier = [element.point01, element.point02, element.point03];
                        let bezierTo = cc.bezierTo(element.time, bezier);
                        seq = cc.sequence(seq, bezierTo)
                    } else if (element.type === "lineto") {
                        let moveTo = cc.moveTo(element.time, element.point01);
                        seq = cc.sequence(seq, moveTo)
                    }
                }

                let callFunc = cc.callFunc(() => {
                    this.actionRun = false;

                    cc.log(JSON.stringify(this.loadArr));
                }, this);

                seq = cc.sequence(seq, callFunc);

                this.touchNode.runAction(seq);
            }
        }

    },

    update(dt) {
        if (this.isAudioGetGj) {
            if (!this.isMiaoMobg && this.actionRun) {
                // cc.log("this.touchNode update: "+this.touchNode.x+"   "+this.touchNode.y)
                this.loadArr[this.index] = cc.v2(Math.round(this.touchNode.x * 100) / 100, Math.round(this.touchNode.y * 100) / 100)

                this.index += 1
            }
        }
    },

    setPos(round,index) {
        if (this.isMiaoMobg) {
            return
        }
        this.arr = this.roundArr[round];
        for (let a = this.newIndex; a < index; a++) {

            const elementold = this.arr[a - 1] || this.arr[a];
            const elementnew = this.arr[a];

            this.graphics.moveTo(elementold.x, elementold.y);

            this.graphics.lineTo(elementnew.x, elementnew.y);

            this.graphics.stroke();
            this.graphics.fill();
        }

        this.newIndex = index;


    },

    clearDraw() {
        this.graphics.clear();
        // this.touchNode.x = this.arr[0].x
        // this.touchNode.y = this.arr[0].y
        this.touchNode.x = this.gj[0].point01.x;
        this.touchNode.y = this.gj[0].point01.y;
    }

    // update (dt) {},
});
