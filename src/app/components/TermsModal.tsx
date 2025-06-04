import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4"
                >
                  利用規約
                </Dialog.Title>
                <div className="mt-2">
                  <div className="prose dark:prose-invert max-w-none">
                    <h4>第1条（適用）</h4>
                    <p>本規約は、当サービスを利用するすべてのユーザーに適用されます。</p>

                    <h4>第2条（禁止事項）</h4>
                    <p>ユーザーは、以下の行為をしてはなりません：</p>
                    <ul>
                      <li>法令または公序良俗に違反する行為</li>
                      <li>当サービスの運営を妨害する行為</li>
                      <li>他のユーザーに迷惑をかける行為</li>
                    </ul>

                    <h4>第3条（免責事項）</h4>
                    <p>当サービスは、ユーザー間のトラブルについて一切の責任を負いません。</p>

                    <h4>第4条（規約の変更）</h4>
                    <p>当サービスは、必要に応じて本規約を変更することができます。</p>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    閉じる
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 