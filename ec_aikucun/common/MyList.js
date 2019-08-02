/**
 * Created by Dbit on 2017/3/26.
 */

const _=require('lodash');

class MyList {
    /**
     *
     * @param [option] {{mainList}}
     */
    constructor(option) {
        this.list = [];
        this.total = 0;
        this.finish = 0;
        this.mainList=_.get(option,'mainList');
    }

    /**
     *
     * @param task {{[name]}|MyList}
     * @returns {*}
     */
    add(task) {
        // console.debug('start ',task.name);
        let _this = this;
        _.defaults(task, {created: new Date(), total: 1, success: [], error: [], finish: 0});
        this.list.push(task);
        this.total += task.total;
        task.end = (err, result) => {
            _this.end(task, err, result);
        };
        return task;
    }
    remove(task){
        let _this=this;
        _.forEach(this.list,(_task,index)=>{
            if (_task===task) {
                _this.list.splice(index,1); //删除元素
                _this.total --;
                _this.finish --;
                return false; //停止循环
            }
        });
    }

    end(task, err, result) {
        if (err) {
            task.error.push(err);
        } else {
            task.success.push(result);
        }
        task.finish++;
        this.finish++;
        global.logger.info(new Error(),task.name, (new Date() - task.created) + 'ms', task.finish > 1 ? task.finish : '');
        // console.debug(this.total,this.finish);
        if (this.finish === (this.total - 1)) this.mainList && this.mainList.end();
    }

    get() {
        return this.list;
    }

    setMainList(list){
        this.mainList=list;
    }

}
module.exports=MyList;