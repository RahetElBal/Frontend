import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Receipt,
  CreditCard,
  Banknote,
  MoreHorizontal,
  Eye,
  FileText,
  Trash2,
  Search,
  User,
  Package,
  Scissors,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/badge";
import { DataTable, type Column } from "@/components/table/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTable } from "@/hooks/useTable";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "@/lib/toast";
import type { Sale, Client, Service, Product } from "@/types/entities";
import { PaymentMethod, SaleStatus } from "@/types/entities";
import { useGet } from "@/hooks/useGet";
import { usePost } from "@/hooks/usePost";

interface SaleItem {
  id: string;
  name: string;
  type: "service" | "product";
  price: number;
  quantity: number;
}

interface CreateSaleDto {
  clientId?: string;
  items: {
    type: "service" | "product";
    itemId: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  paymentMethod: PaymentMethod;
  discount?: number;
}

const statusColors: Record<
  SaleStatus,
  "default" | "success" | "warning" | "error"
> = {
  [SaleStatus.COMPLETED]: "success",
  [SaleStatus.PENDING]: "warning",
  [SaleStatus.REFUNDED]: "error",
  [SaleStatus.CANCELLED]: "error",
};

const paymentIcons: Record<PaymentMethod, typeof CreditCard> = {
  [PaymentMethod.CARD]: CreditCard,
  [PaymentMethod.CASH]: Banknote,
  [PaymentMethod.BANK_TRANSFER]: Receipt,
  [PaymentMethod.OTHER]: Receipt,
};

export function SalesPage() {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    "card" as PaymentMethod,
  );
  const [discount, setDiscount] = useState(0);
  const [searchItem, setSearchItem] = useState("");

  // Fetch data from API (scoped to current salon)
  const { data: sales = [], isLoading } = useGet<Sale[]>("sales");
  const { data: clients = [] } = useGet<Client[]>("clients");
  const { data: services = [] } = useGet<Service[]>("services");
  const { data: products = [] } = useGet<Product[]>("products");

  // Create sale mutation (includes salonId automatically)
  const createSale = usePost<Sale, CreateSaleDto>("sales", {
    onSuccess: () => {
      toast.success(t("sales.newSale") + " - " + t("common.success"));
      closeModal();
    },
    onError: (error) => {
      toast.error(error.message || t("common.error"));
    },
  });

  const table = useTable<Sale>({
    data: sales,
    searchKeys: ["id"],
  });

  // Calculate totals
  const subtotal = useMemo(
    () => saleItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [saleItems],
  );
  const total = subtotal - discount;

  const todayTotal = sales.reduce((sum, sale) => sum + sale.total, 0);
  const averageTicket = sales.length > 0 ? todayTotal / sales.length : 0;

  // Filter services and products for search
  const filteredServices = useMemo(
    () =>
      services.filter(
        (s) =>
          s.name.toLowerCase().includes(searchItem.toLowerCase()) &&
          !saleItems.some((item) => item.id === `service-${s.id}`),
      ),
    [services, searchItem, saleItems],
  );

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchItem.toLowerCase()) &&
          !saleItems.some((item) => item.id === `product-${p.id}`),
      ),
    [products, searchItem, saleItems],
  );

  const closeModal = () => {
    setIsAddModalOpen(false);
    setSelectedClientId("");
    setSaleItems([]);
    setPaymentMethod("card" as PaymentMethod);
    setDiscount(0);
    setSearchItem("");
  };

  const addService = (service: Service) => {
    setSaleItems([
      ...saleItems,
      {
        id: `service-${service.id}`,
        name: service.name,
        type: "service",
        price: service.price,
        quantity: 1,
      },
    ]);
    setSearchItem("");
  };

  const addProduct = (product: Product) => {
    setSaleItems([
      ...saleItems,
      {
        id: `product-${product.id}`,
        name: product.name,
        type: "product",
        price: product.price,
        quantity: 1,
      },
    ]);
    setSearchItem("");
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    setSaleItems(
      saleItems.map((item) =>
        item.id === itemId ? { ...item, quantity } : item,
      ),
    );
  };

  const removeItem = (itemId: string) => {
    setSaleItems(saleItems.filter((item) => item.id !== itemId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saleItems.length === 0) {
      toast.error("Ajoutez au moins un article");
      return;
    }

    createSale.mutate({
      clientId:
        selectedClientId && selectedClientId !== "walk-in"
          ? selectedClientId
          : undefined,
      items: saleItems.map((item) => ({
        type: item.type,
        itemId: item.id.replace(`${item.type}-`, ""),
        quantity: item.quantity,
        price: item.price,
      })),
      total,
      paymentMethod,
      discount: discount > 0 ? discount : undefined,
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const columns: Column<Sale>[] = [
    {
      key: "id",
      header: t("fields.receipt"),
      render: (sale) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-accent-pink/10 flex items-center justify-center">
            <Receipt className="h-4 w-4 text-accent-pink" />
          </div>
          <div>
            <p className="font-mono text-sm">
              {sale.id.slice(0, 8).toUpperCase()}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatTime(sale.createdAt)}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "client",
      header: t("fields.client"),
      render: (sale) =>
        sale.client ? (
          <span>
            {sale.client.firstName} {sale.client.lastName}
          </span>
        ) : (
          <span className="text-muted-foreground">{t("sales.walkIn")}</span>
        ),
    },
    {
      key: "items",
      header: t("fields.items"),
      render: (sale) => (
        <div>
          <p className="text-sm">
            {sale.items.length}{" "}
            {sale.items.length === 1 ? t("common.item") : t("common.items")}
          </p>
          <p className="text-xs text-muted-foreground truncate max-w-50">
            {sale.items.map((i) => i.name).join(", ")}
          </p>
        </div>
      ),
    },
    {
      key: "paymentMethod",
      header: t("fields.payment"),
      render: (sale) => {
        const Icon = paymentIcons[sale.paymentMethod];
        return (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="capitalize">
              {t(
                `sales.${sale.paymentMethod === "bank_transfer" ? "bankTransfer" : sale.paymentMethod}`,
              )}
            </span>
          </div>
        );
      },
    },
    {
      key: "total",
      header: t("fields.total"),
      sortable: true,
      render: (sale) => (
        <div>
          <p className="font-semibold">{formatCurrency(sale.total)}</p>
          {sale.discount > 0 && (
            <p className="text-xs text-green-600">
              -{formatCurrency(sale.discount)} {t("sales.discount")}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: t("fields.status"),
      render: (sale) => (
        <Badge variant={statusColors[sale.status]}>{sale.status}</Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-12",
      render: () => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="h-4 w-4 me-2" />
              {t("common.view")}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileText className="h-4 w-4 me-2" />
              {t("sales.printReceipt")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("nav.sales")}
        description={t("sales.description")}
        actions={
          <Button className="gap-2" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4" />
            {t("sales.newSale")}
          </Button>
        }
      />

      {/* Today's Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            {t("sales.todayTotal")}
          </p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(todayTotal)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            {t("sales.transactions")}
          </p>
          <p className="text-2xl font-bold">{sales.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            {t("sales.averageTicket")}
          </p>
          <p className="text-2xl font-bold">{formatCurrency(averageTicket)}</p>
        </Card>
      </div>

      <DataTable
        table={table}
        columns={columns}
        searchPlaceholder={t("sales.searchPlaceholder")}
        emptyMessage={isLoading ? t("common.loading") : t("sales.noSales")}
      />

      {/* New Sale Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("sales.newSale")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6 py-4">
              {/* Client Selection */}
              <div className="space-y-2">
                <Label>{t("fields.client")}</Label>
                <Select
                  value={selectedClientId}
                  onValueChange={setSelectedClientId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("sales.selectClient")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="walk-in">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {t("sales.walkIn")}
                      </div>
                    </SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {client.firstName} {client.lastName}
                          {client.phone && (
                            <span className="text-muted-foreground text-xs">
                              ({client.phone})
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Add Items */}
              <div className="space-y-2">
                <Label>{t("sales.selectProduct")}</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("common.search")}
                    value={searchItem}
                    onChange={(e) => setSearchItem(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {searchItem && (
                  <Card className="p-2 max-h-48 overflow-y-auto">
                    {filteredServices.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs font-semibold text-muted-foreground px-2 py-1">
                          {t("nav.services")}
                        </p>
                        {filteredServices.slice(0, 5).map((service) => (
                          <button
                            key={service.id}
                            type="button"
                            onClick={() => addService(service)}
                            className="w-full flex items-center justify-between p-2 hover:bg-muted rounded-md transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <Scissors className="h-4 w-4 text-accent-pink" />
                              <span>{service.name}</span>
                            </div>
                            <span className="font-medium">
                              {formatCurrency(service.price)}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                    {filteredProducts.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground px-2 py-1">
                          {t("nav.products")}
                        </p>
                        {filteredProducts.slice(0, 5).map((product) => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => addProduct(product)}
                            className="w-full flex items-center justify-between p-2 hover:bg-muted rounded-md transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-blue-500" />
                              <span>{product.name}</span>
                            </div>
                            <span className="font-medium">
                              {formatCurrency(product.price)}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                    {filteredServices.length === 0 &&
                      filteredProducts.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">
                          {t("common.noResults")}
                        </p>
                      )}
                  </Card>
                )}
              </div>

              {/* Selected Items */}
              {saleItems.length > 0 && (
                <div className="space-y-2">
                  <Label>{t("fields.items")}</Label>
                  <Card className="divide-y">
                    {saleItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3"
                      >
                        <div className="flex items-center gap-3">
                          {item.type === "service" ? (
                            <Scissors className="h-4 w-4 text-accent-pink" />
                          ) : (
                            <Package className="h-4 w-4 text-blue-500" />
                          )}
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency(item.price)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                            >
                              -
                            </Button>
                            <span className="w-8 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                            >
                              +
                            </Button>
                          </div>
                          <span className="font-medium w-20 text-right">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </Card>
                </div>
              )}

              {/* Payment & Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("sales.paymentMethod")}</Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={(value: string) =>
                      setPaymentMethod(value as PaymentMethod)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          {t("sales.card")}
                        </div>
                      </SelectItem>
                      <SelectItem value="cash">
                        <div className="flex items-center gap-2">
                          <Banknote className="h-4 w-4" />
                          {t("sales.cash")}
                        </div>
                      </SelectItem>
                      <SelectItem value="bank_transfer">
                        <div className="flex items-center gap-2">
                          <Receipt className="h-4 w-4" />
                          {t("sales.bankTransfer")}
                        </div>
                      </SelectItem>
                      <SelectItem value="other">{t("sales.other")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("fields.discount")}</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discount}
                    onChange={(e) =>
                      setDiscount(parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
              </div>

              {/* Total Summary */}
              {saleItems.length > 0 && (
                <Card className="p-4 bg-muted/50">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{t("fields.subtotal")}</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>{t("fields.discount")}</span>
                        <span>-{formatCurrency(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>{t("fields.total")}</span>
                      <span className="text-accent-pink">
                        {formatCurrency(total)}
                      </span>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal}>
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={createSale.isPending || saleItems.length === 0}
              >
                {createSale.isPending ? t("common.loading") : t("common.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
