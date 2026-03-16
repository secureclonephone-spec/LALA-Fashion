"use client";
import { Accordion, AccordionItem } from "@heroui/accordion";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/react";
import React, { FC } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import Prose from "@/components/theme/search/Prose";
import ReviewSection from "../review/ReviewSection";
import ReviewDetail from "../review/ReviewDetail";
import { additionalDataTypes } from "../type";

export const ProductMoreDetails: FC<{
  description: string;
  additionalData: additionalDataTypes[];
  productId: string;
  reviews: any[];
  totalReview: number;
}> = ({ description, additionalData, reviews, productId, totalReview }) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [expandedKeys, setExpandedKeys] = React.useState<Set<string>>(new Set());
  const [isReviewsModalOpen, setIsReviewsModalOpen] = React.useState(false);

  const filterAdditionalData = additionalData.filter((item) => item?.attribute?.isVisibleOnFront == "1");

  return (
    <div className="mt-7 sm:my-7">
      <Accordion
        itemClasses={{
          base: "shadow-none  bg-neutral-100 dark:bg-neutral-800",
        }}
        className="px-0"
        selectionMode="multiple"
        showDivider={false}
        variant="splitted"
        selectedKeys={expandedKeys}
        onSelectionChange={(keys) => setExpandedKeys(keys as Set<string>)}
      >
        <AccordionItem
          key="1"
          classNames={{
            title: "text-start",
            trigger: "cursor-pointer",
          }}
          indicator={({ isOpen }) =>
            isOpen ? (
              <ChevronLeftIcon className="h-5 w-5 stroke-neutral-800 dark:stroke-white" />
            ) : (
              <ChevronRightIcon className="h-5 w-5 stroke-neutral-800 dark:stroke-white" />
            )
          }
          aria-label="Description"
          title="Description"
        >
          <Prose className="pb-2 text-selected-black dark:text-white font-light" html={description} />
        </AccordionItem>

        {filterAdditionalData.length > 0
          ?
          <AccordionItem
            key="2"
            classNames={{
              title: "text-start",
              trigger: "cursor-pointer",
            }}
            indicator={({ isOpen }) =>
              isOpen ? (
                <ChevronLeftIcon className="h-5 w-5 stroke-neutral-800 dark:stroke-white" />
              ) : (
                <ChevronRightIcon className="h-5 w-5 stroke-neutral-800 dark:stroke-white" />
              )
            }
            aria-label="Additional Information"
            title="Additional Information"
          >
            <div className="grid max-w-max grid-cols-[auto_1fr] gap-x-8 gap-y-4 px-1 pb-2">
              {filterAdditionalData?.map((item) => (
                <React.Fragment key={item.label}>
                  <div className="grid">
                    <p className="text-base font-normal text-selected-black dark:text-white">
                      {item?.attribute?.adminName}
                    </p>
                  </div>
                  <div className="grid">
                    <p className="text-base font-normal text-selected-black dark:text-white">
                      {item?.value || "--"}
                    </p>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </AccordionItem>

          : null}
      </Accordion>

      {/* Standalone Ratings Button mimicking accordion item */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsReviewsModalOpen(true)}
        className="mt-2 flex w-full items-center justify-between px-4 py-4 bg-neutral-100 dark:bg-neutral-800 rounded-medium shadow-none cursor-pointer transition-opacity hover:opacity-80 rounded-xl"
      >
        <span className="text-start text-foreground">Ratings</span>
        <ChevronRightIcon className="h-5 w-5 stroke-neutral-800 dark:stroke-white" />
      </div>

      <Modal
        isOpen={isReviewsModalOpen}
        onOpenChange={setIsReviewsModalOpen}
        backdrop="blur"
        size="4xl"
        scrollBehavior="inside"
        placement="center"
        classNames={{
          wrapper: "z-[100] items-center justify-center",
          backdrop: "z-[99]",
          base: "bg-white dark:bg-neutral-900 rounded-xl mx-4",
          header: "border-b border-neutral-200 dark:border-neutral-800",
          body: "py-6",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Ratings & Reviews</ModalHeader>
              <ModalBody>
                <div className="w-full">
                  {totalReview > 0 ? (
                    <ReviewDetail
                      reviewDetails={reviews}
                      totalReview={totalReview}
                      productId={productId}
                    />
                  ) : (
                    <ReviewSection productId={productId} totalReview={totalReview} />
                  )}
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
