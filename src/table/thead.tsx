import {
  defineComponent, computed, SetupContext, PropType, ref,
} from '@vue/composition-api';
import isFunction from 'lodash/isFunction';
import { CreateElement } from 'vue';
import { getColumnFixedStyles } from './hooks/useFixed';
import { RowAndColFixedPosition, BaseTableColumns, ThRowspanAndColspan } from './interface';
import useClassName from './hooks/useClassName';
import { useConfig } from '../config-provider/useConfig';
import { BaseTableCol, TableRowData } from './type';
import { renderTitle } from './hooks/useTableHeader';
import TEllipsis from './ellipsis';

export interface TheadProps {
  // 是否固定表头
  isFixedHeader: boolean;
  // 固定列 left/right 具体值
  rowAndColFixedPosition: RowAndColFixedPosition;
  // 虚拟滚动单独渲染表头；表头吸顶单独渲染表头
  thWidthList?: { [colKey: string]: number };
  bordered: boolean;
  isMultipleHeader: boolean;
  spansAndLeafNodes: {
    rowspanAndColspanMap: ThRowspanAndColspan;
    leafColumns: BaseTableCol<TableRowData>[];
  };
  thList: BaseTableCol<TableRowData>[][];
  columnResizeParams: {
    resizeLineRef: HTMLDivElement;
    resizeLineStyle: Object;
    onColumnMouseover: (e: MouseEvent) => void;
    onColumnMousedown: (
      e: MouseEvent,
      col: BaseTableCol<TableRowData>,
      effectNextCol: BaseTableCol<TableRowData>,
      effectPrevCol: BaseTableCol<TableRowData>,
    ) => void;
  };
  resizable: Boolean;
}

export default defineComponent({
  name: 'THead',

  props: {
    isFixedHeader: Boolean,
    rowAndColFixedPosition: Map as PropType<TheadProps['rowAndColFixedPosition']>,
    thWidthList: Object as PropType<TheadProps['thWidthList']>,
    bordered: Boolean,
    isMultipleHeader: Boolean,
    resizable: Boolean,
    spansAndLeafNodes: Object as PropType<TheadProps['spansAndLeafNodes']>,
    thList: Array as PropType<TheadProps['thList']>,
    columnResizeParams: Object as PropType<TheadProps['columnResizeParams']>,
  },

  setup(props: TheadProps, { slots }: SetupContext) {
    const theadRef = ref<HTMLHeadElement>();
    const classnames = useClassName();
    const { tableHeaderClasses, tableBaseClass } = classnames;
    const { classPrefix } = useConfig();
    const theadClasses = computed(() => [
      tableHeaderClasses.header,
      {
        [tableHeaderClasses.fixed]: props.isFixedHeader,
        [tableBaseClass.bordered]: props.bordered && props.isMultipleHeader,
        [tableHeaderClasses.multipleHeader]: props.isMultipleHeader,
      },
    ]);

    return {
      ...classnames,
      theadRef,
      theadClasses,
      classPrefix,
      slots,
    };
  },

  render(h) {
    // eslint-disable-next-line
    const renderThNodeList = (
      h: CreateElement,
      rowAndColFixedPosition: RowAndColFixedPosition,
      thWidthList: TheadProps['thWidthList'],
    ) => {
      // thBorderMap: rowspan 会影响 tr > th 是否为第一列表头，从而影响边框
      const thBorderMap = new Map<any, boolean>();
      const thRowspanAndColspan = this.spansAndLeafNodes.rowspanAndColspanMap;
      return this.thList.map((row, rowIndex) => {
        const thRow = row.map((col: BaseTableColumns[0], index: number) => {
          const rowspanAndColspan = thRowspanAndColspan.get(col);
          if (index === 0 && rowspanAndColspan.rowspan > 1) {
            for (let j = rowIndex + 1; j < rowIndex + rowspanAndColspan.rowspan; j++) {
              thBorderMap.set(this.thList[j][0], true);
            }
          }
          const thStyles = getColumnFixedStyles(col, index, rowAndColFixedPosition, this.tableColFixedClasses);
          const colParams = {
            col,
            colIndex: index,
            row: {},
            rowIndex: -1,
          };
          const customClasses = isFunction(col.className) ? col.className({ ...colParams, type: 'th' }) : col.className;
          const thClasses = [
            thStyles.classes,
            customClasses,
            {
              // 受 rowspan 影响，部分 tr > th:first-child 需要补足左边框
              [this.tableHeaderClasses.thBordered]: thBorderMap.get(col),
              [`${this.classPrefix}-table__th-${col.colKey}`]: col.colKey,
              [this.tdAlignClasses[col.align]]: col.align && col.align !== 'left',
            },
          ];
          const withoutChildren = !col.children?.length;
          const width = withoutChildren && thWidthList?.[col.colKey] ? `${thWidthList?.[col.colKey]}px` : undefined;
          const styles = { ...(thStyles.style || {}), width };
          const innerTh = renderTitle(h, this.slots, col, index);
          const resizeColumnListener = this.resizable
            ? {
              mousedown: (e: MouseEvent) => this.columnResizeParams?.onColumnMousedown?.(
                e,
                col,
                index < row.length - 1 ? row[index + 1] : row[index - 1],
                index > 0 ? row[index - 1] : row[index + 1],
              ),
              mousemove: (e: MouseEvent) => this.columnResizeParams?.onColumnMouseover?.(e),
            }
            : {};
          const content = isFunction(col.ellipsisTitle) ? col.ellipsisTitle(h, { col, colIndex: index }) : undefined;
          return (
            <th
              key={col.colKey}
              data-colkey={col.colKey}
              class={thClasses}
              style={styles}
              attrs={{ ...rowspanAndColspan }}
              on={resizeColumnListener}
            >
              <div class={this.tableBaseClass.thCellInner}>
                {col.ellipsis && col.ellipsisTitle !== false && col.ellipsisTitle !== null ? (
                  <TEllipsis
                    placement="bottom"
                    attach={this.theadRef ? () => this.theadRef : undefined}
                    popupContent={content && (() => content)}
                    popupProps={typeof col.ellipsisTitle === 'object' ? col.ellipsisTitle : undefined}
                  >
                    {innerTh}
                  </TEllipsis>
                ) : (
                  innerTh
                )}
              </div>
            </th>
          );
        });
        return <tr key={rowIndex}>{thRow}</tr>;
      });
    };

    return (
      <thead ref="theadRef" class={this.theadClasses}>
        {renderThNodeList(h, this.rowAndColFixedPosition, this.thWidthList)}
      </thead>
    );
  },
});
