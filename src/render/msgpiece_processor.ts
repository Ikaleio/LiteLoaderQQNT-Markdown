import { useSettingsStore } from '@/states/settings';
import { escapeHtml, purifyHtml, unescapeHtml } from '@/utils/htmlProc';
import { mditLogger } from '@/utils/logger';

type ReplaceFunc = (parentElement: HTMLElement, id: string) => any;

const TEXT_ELEMENT_MATCHER = 'text-element';
const IMG_ELEMENT_MATCHER = 'pic-element';

/**
 * Data type used by renderer to determine how to render and replace an element.
 */
export interface MsgProcessInfo {
    mark: string;
    replace?: ReplaceFunc;
    id?: string;
}

/**
 * Function type that used to process children elements inside QQNT message box.
 */
type FragmentProcessFunc = (element: HTMLElement, index: number) => MsgProcessInfo | undefined;

function textElementProcessor(element: Element): MsgProcessInfo | undefined {
    // return undefine if type not match
    if (!(element.tagName == 'SPAN') || !element.classList.contains(TEXT_ELEMENT_MATCHER) || element.querySelector('.text-element--at')) {
        return undefined;
    }

    mditLogger('debug', 'ElementMatch', 'Source', element);
    mditLogger('debug', 'Element', 'Match', 'spanTextProcessor');

    // text processor
    let settings = useSettingsStore.getState();
    function entityProcesor(x: string) {
        if (settings.unescapeAllHtmlEntites == true) {
            return unescapeHtml(x);
        }
        if (settings.unescapeGtInText == true) {
            return x.replaceAll('&gt;', '>');
        }
        return x;
    }

    return {
        mark: Array.from(element.getElementsByTagName("span"))
            .map((element) => element.innerHTML)
            .reduce((acc, x) => acc + entityProcesor(x), ''),
    };
}

/**
 * This fucked up everything.
 */
const picElementProcessor = replaceFuncGenerator({ filter: (e) => e.classList.contains(IMG_ELEMENT_MATCHER), placeholder: (id) => (` <span id="${id}"></span> `) });

const spanReplaceProcessor = replaceFuncGenerator({
    filter: (e) => (
        e.tagName == 'SPAN' || // deal with span
        (e.tagName == 'DIV' && (e.classList?.contains('reply-element') ?? false)) // deal with reply element
    )
});


interface replaceFuncGeneratorProps {
    /**
     * The generated processort with only deal with elements which this filter returns `true`.
     */
    filter: (element: HTMLElement) => boolean,
    /**
     * Custom function to generate placeholder text based on id.
     */
    placeholder?: (id: string) => string,
    /**
     * Custom replace function. Use defaul one if `undefined`.
     */
    replace?: (parent: HTMLElement, id: string) => any,
}

function replaceFuncGenerator(
    props: replaceFuncGeneratorProps,
): FragmentProcessFunc {
    let {
        filter,
        placeholder,
    } = props;
    placeholder ??= (id) => (`<span id="${id}"></span>`);

    return function (element: HTMLElement, index: number) {
        if (!filter(element)) {
            return undefined;
        }

        let id = `placeholder-${index}`;
        let replace = props.replace;

        replace ??= (parent: HTMLElement, id: string) => {
            try {
                // here oldNode may be `undefined` or  `null`.
                // Plugin will broke without this try catch block.
                mditLogger('debug', 'Try replace oldNode with element:', element);
                mditLogger('debug', 'Search placeholder with id', id);

                const oldNode = parent.querySelector(`#${id}`);
                mditLogger('debug', 'Old node found', oldNode);

                oldNode.replaceWith(element);
                mditLogger('debug', 'Replace success:', element);
            } catch (e) {
                mditLogger('error', 'Replace failed on element:', element, e);
            }
        };

        return {
            mark: placeholder(id),
            id: id,
            replace: replace,
        }
    }
}

/**
 * Triggered from begin to end, preemptive.
 */
export const processorList: FragmentProcessFunc[] = [
    picElementProcessor,
    textElementProcessor,
    spanReplaceProcessor,
];