import { form } from './Settings'
import { log } from './Log'
import { EVT } from './EVT'

interface FilterOption {
  id?: number | string
  date?: string
  fee?: number
  ext?: string
}

// 审查每个文件的数据，决定是否要下载它
class Filter {
  // 文件类型。fanbox 允许直接上传在投稿里的文件类型只有这些
  private readonly fileType = {
    image: ['jpg', 'jpeg', 'png', 'gif'],
    music: ['wav', 'mp3', 'flac'],
    video: ['mp4', 'mov', 'avi', 'clip'],
    compressed: ['zip'],
    ps: ['psd'],
    other: ['txt', 'pdf'],
  }

  public init() {
    this.getIdRange()
    this.getDateRange()
  }

  // 获取 id 范围设置
  private getIdRange() {
    if (form.idRangeSwitch.checked) {
      let id = parseInt(form.idRangeInput.value)
      if (isNaN(id)) {
        EVT.fire(EVT.events.crawlError)

        const msg = 'id is not a number!'
        window.alert(msg)
        log.error(msg)
        throw new Error(msg)
      }
    }
  }

  private getDateRange() {
    if (form.postDate.checked) {
      const date = new Date(form.postDateInput.value).getTime()
      if (isNaN(date)) {
        EVT.fire(EVT.events.crawlError)

        const msg = 'Date format error!'
        window.alert(msg)
        log.error(msg)
        throw new Error(msg)
      }
    }
  }

  // 检查作品是否符合过滤器的要求
  // 想要检查哪些数据就传递哪些数据，不需要传递 FilterOption 的所有选项
  public check(option: FilterOption) {
    // 检查文件类型
    if (!this.checkFileType(option.ext)) {
      return false
    }

    // 检查收费还是免费
    if (!this.checkfeeType(option.fee)) {
      return false
    }

    // 检查价格范围
    if (!this.checkfeeRange(option.fee)) {
      return false
    }

    // 检查 id 范围
    if (!this.checkIdRange(option.id)) {
      return false
    }

    // 检查投稿时间
    if (!this.checkPostDate(option.date)) {
      return false
    }

    return true
  }

  private checkFileType(ext: FilterOption['ext']) {
    // 如果没有传递 ext，则保留这个文件
    if (!ext) {
      return true
    }

    // 检查 ext 存在于哪种类型里，然后检查这个类型是否被选中
    for (const [key, value] of Object.entries(this.fileType)) {
      if (value.includes(ext)) {
        return form[key].checked ? true : false
      }
    }

    // 如果这个 ext 不存在任何规定的类型里，则把它当作 other 类型，决定是否保留
    return form['other'].checked ? true : false
  }

  private checkfeeType(fee: FilterOption['fee']) {
    if (fee === undefined) {
      return true
    }

    if (fee > 0) {
      return form.pay.checked
    } else {
      return form.free.checked
    }
  }

  private checkfeeRange(fee: FilterOption['fee']) {
    if (fee === undefined || !form.feeSwitch.checked) {
      return true
    }

    return fee >= parseInt(form.fee.value)
  }

  private checkIdRange(id: FilterOption['id']) {
    if (id === undefined || !form.idRangeSwitch.checked) {
      return true
    }

    const flag = parseInt(form.idRange.value)
    const nowId = parseInt(id.toString())
    const setId = parseInt(form.idRangeInput.value)

    if (flag === 1) {
      // 大于
      return nowId > setId
    } else if (flag === 2) {
      // 小于
      return nowId < setId
    } else {
      return true
    }
  }

  private checkPostDate(date: FilterOption['date']) {
    if (!form.postDate.checked || date === undefined) {
      return true
    }

    const flag = parseInt(form.postRange.value)
    const setDate = new Date(form.postDateInput.value)
    const postDate = new Date(date)

    if (flag === -1) {
      // 小于
      return postDate < setDate
    } else if (flag === 1) {
      // 大于
      return postDate > setDate
    } else {
      return true
    }
  }

  // 当需要时抛出错误
  private throwError(msg: string) {
    EVT.fire(EVT.events.crawlError)
    log.error(msg, 2)
    window.alert(msg)
    throw new Error(msg)
  }
}

const filter = new Filter()
export { filter, FilterOption }
