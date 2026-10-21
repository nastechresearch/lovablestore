import Link from "next/link";
import { Sparkles, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDateShort } from "@/lib/format";
import {
  createTagAction,
  deleteTagAction,
  toggleTagFeaturedAction,
} from "@/actions/admin-tags";
import { AdminHeading, EmptyState } from "@/components/admin/admin-ui";
import { TagForm } from "@/components/admin/tag-form";

export const dynamic = "force-dynamic";

const KIND_ORDER = ["CURATED", "OCCASION", "RECIPIENT", "PRICE", "STYLE", "SUPPLIER"];

export default async function AdminTagsPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>;
}) {
  const flags = await searchParams;
  const tags = await prisma.tag.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  tags.sort((a, b) => {
    const kindDelta = KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind);
    return kindDelta !== 0 ? kindDelta : a.name.localeCompare(b.name);
  });

  const featured = tags.filter((tag) => tag.featured).length;
  const unused = tags.filter((tag) => tag._count.products === 0).length;

  return (
    <div className="space-y-6">
      <AdminHeading
        eyebrow="Merchandising"
        title="Tags"
        description={`${tags.length} tags · ${featured} featured · ${unused} unused. Tags connect products to edits, filters and scoped promos.`}
      />

      {flags.created ? (
        <p role="status" className="border border-oxblood/25 bg-oxblood/5 px-4 py-3 text-[11px] text-oxblood">
          Tag created.
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <div className="space-y-5 xl:sticky xl:top-6 xl:self-start">
          <TagForm action={createTagAction} />
          <div className="border border-line bg-cream p-5 text-[11px] leading-relaxed text-stone">
            <p className="flex items-center gap-2 text-champagne-dark">
              <Sparkles className="size-4" aria-hidden />
              <span className="text-[9px] uppercase tracking-[0.16em]">Tag tips</span>
            </p>
            <p className="mt-3">
              Use <strong className="font-medium text-ink">OCCASION</strong> tags for
              Mzansi moments like Heritage Day or payday. Promos can target any tag
              slug, so one tag can power an entire campaign.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {tags.length === 0 ? (
            <EmptyState
              title="No tags yet."
              copy="Create your first tag to start grouping products into edits."
            />
          ) : (
            <div className="overflow-x-auto border border-line bg-cream">
              <table className="w-full min-w-[640px] text-left text-[12px]">
                <thead>
                  <tr className="border-b border-line text-[8.5px] uppercase tracking-[0.14em] text-stone">
                    <th className="px-4 py-3 font-medium">Tag</th>
                    <th className="px-3 py-3 font-medium">Type</th>
                    <th className="px-3 py-3 font-medium">Products</th>
                    <th className="px-3 py-3 font-medium">Featured</th>
                    <th className="px-3 py-3 font-medium">Created</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {tags.map((tag) => (
                    <tr key={tag.id} className="transition-colors hover:bg-ivory/60">
                      <td className="px-4 py-3">
                        <Link href={`/tag/${tag.slug}`} target="_blank" className="font-medium text-oxblood hover:underline">
                          {tag.name}
                        </Link>
                        <p className="text-[9.5px] text-stone">/tag/{tag.slug}</p>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-[9px] uppercase tracking-[0.1em] text-stone">{tag.kind}</span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={tag._count.products === 0 ? "text-stone" : "font-medium"}>
                          {tag._count.products}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <form action={toggleTagFeaturedAction.bind(null, tag.id)}>
                          <button
                            type="submit"
                            className={`inline-flex px-2 py-1 text-[8.5px] uppercase tracking-[0.12em] ${
                              tag.featured ? "bg-oxblood/10 text-oxblood" : "bg-ink/8 text-stone"
                            }`}
                          >
                            {tag.featured ? "Featured" : "Standard"}
                          </button>
                        </form>
                      </td>
                      <td className="px-3 py-3 text-[10.5px] text-stone">{formatDateShort(tag.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <form action={deleteTagAction.bind(null, tag.id)}>
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.1em] text-stone hover:text-oxblood"
                            aria-label={`Delete ${tag.name}`}
                          >
                            <Trash2 className="size-3.5" aria-hidden />
                            Delete
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="text-[10px] text-stone">
            Deleting a tag removes it from products; the products themselves stay live.
          </p>
        </div>
      </div>
    </div>
  );
}
